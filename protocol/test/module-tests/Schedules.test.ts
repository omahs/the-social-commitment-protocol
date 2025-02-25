import { expect } from "chai";
import { BigNumber } from "ethers";
import { deploy, deployTyped, makeDeploymentFixture } from "../helpers/deploy";
import { currentTimestamp, dayOfWeek, timeOfDay } from "../helpers/time";
import { advanceTime } from "../helpers/providerUtils";
import { AlarmScheduleMock, DeadlineScheduleMock } from "../../typechain-types";

describe("Schedule Modules Tests", () => {
  let blockTime: BigNumber;

  beforeEach(async () => (blockTime = await currentTimestamp()));

  describe("Deadline Schedule Test", () => {
    let schedule: DeadlineScheduleMock;
    beforeEach(async () => {
      schedule = await deployTyped<DeadlineScheduleMock>(
        "DeadlineScheduleMock"
      );
    });

    it("Cannot be initialized with a deadline in the past", async () => {
      await expect(schedule.init(blockTime.sub(1), 1)).to.revertedWith(
        "INVALID_DEADLINE"
      );
    });
    it("Reports 0 entries when initialized", async () => {
      await (await schedule.init(blockTime.add(60), 10)).wait();
      expect(await schedule.entries()).to.equal(0);
    });
    describe("recordEntry()", () => {
      it("Cannot record an entry before the submission window", async () => {
        await (await schedule.init(blockTime.add(60), 10)).wait();
        await expect(schedule.recordEntry()).to.revertedWith(
          "NOT_IN_SUBMISSION_WINDOW"
        );
      });
      it("Cannot record an entry after the deadline", async () => {
        blockTime = await currentTimestamp();
        await (await schedule.init(blockTime.add(2), 2)).wait();
        await advanceTime(60);
        await expect(schedule.recordEntry()).to.revertedWith(
          "NOT_IN_SUBMISSION_WINDOW"
        );
      });
    });
    describe("missedDeadlines()", () => {
      it("Returns 0 before deadline", async () => {
        await (await schedule.init(blockTime.add(60), 10)).wait();
        expect(await schedule.missedDeadlines()).to.equal(0);
      });
      it("(after deadline) Returns 0 if a confirmation was submitted within the window", async () => {
        await (await schedule.init(blockTime.add(10), 10)).wait();
        await (await schedule.recordEntry()).wait();
        await advanceTime(60);
        expect(await schedule.missedDeadlines()).to.equal(0);
      });
      it("(after deadline) Returns 1 if no confirmation was submitted within the window", async () => {
        await (await schedule.init(blockTime.add(10), 10)).wait();
        await advanceTime(60);
        expect(await schedule.missedDeadlines()).to.equal(1);
      });
    });
  });

  describe("Alarm Schedule Test", () => {
    let schedule: AlarmScheduleMock;
    beforeEach(async () => {
      schedule = await deployTyped<AlarmScheduleMock>("AlarmScheduleMock");
    });

    it("Can only be initialized with a valid time of day and days array", async () => {
      await expect(schedule.init(86399, [1], 60, 0)).to.not.reverted;
      await expect(schedule.init(500, [1], 60, 0)).to.not.reverted;
      await expect(schedule.init(86400, [1], 60, 0)).to.revertedWith(
        "INVALID_ALARM_TIME"
      );

      await expect(schedule.init(1, [1], 60, 0)).to.not.reverted;
      await expect(schedule.init(1, [7], 60, 0)).to.not.reverted;
      await expect(schedule.init(1, [], 60, 0)).to.revertedWith("INVALID_DAYS");
      await expect(schedule.init(1, [0], 60, 0)).to.revertedWith(
        "INVALID_DAYS"
      );
      await expect(
        schedule.init(1, [1, 2, 3, 4, 5, 6, 7, 8], 60, 0)
      ).to.revertedWith("INVALID_DAYS");
    });

    it("Reports 0 entries when initialized", async () => {
      await (await schedule.init(1, [1], 60, 0)).wait();
      expect(await schedule.entries()).to.equal(0);
    });

    describe("recordEntry()", () => {
      let blockTime: BigNumber;
      let curTimeOfDay: number;
      let weekDay: number;

      beforeEach(async () => {
        blockTime = await currentTimestamp();
        curTimeOfDay = timeOfDay(blockTime.toNumber());
        weekDay = dayOfWeek(blockTime.toNumber());
      });

      it("Only allows entries to be recorded when the block time is within submission window of an alarm time", async () => {
        // Init an alarm that will be due in 60 seconds (30 second submission window)
        await (
          await schedule.init(curTimeOfDay + 60, [weekDay, weekDay + 1], 30, 0)
        ).wait();

        await expect(schedule.recordEntry()).to.revertedWith(
          "NOT_IN_SUBMISSION_WINDOW"
        );
        await advanceTime(30);
        await expect(schedule.recordEntry()).to.not.reverted;
        expect(await schedule.entries()).to.equal(1);
      });

      it("Prevents duplicate entries", async () => {
        await (
          await schedule.init(curTimeOfDay + 60, [weekDay, weekDay + 1], 60, 0)
        ).wait();

        await expect(schedule.recordEntry()).to.not.reverted;
        await expect(schedule.recordEntry()).to.revertedWith(
          "ALREADY_SUBMITTED_TODAY"
        );
        expect(await schedule.entries()).to.equal(1);
        expect(await schedule.missedDeadlines()).to.equal(0);
      });

      it("Will not accept an entry on the same initialization day if alarm time has passed", async () => {
        const missedBySeconds = 60;

        await (
          await schedule.init(
            curTimeOfDay - missedBySeconds,
            [weekDay, weekDay + 1],
            60,
            0
          )
        ).wait();

        await expect(schedule.recordEntry()).to.revertedWith(
          "NOT_IN_SUBMISSION_WINDOW"
        );
        expect(await schedule.entries()).to.equal(0);
        expect(await schedule.missedDeadlines()).to.equal(0);

        // Advance time by a little les than a week
        await advanceTime(60 * 60 * 24 * 7 - (missedBySeconds + 10));
        await expect(schedule.recordEntry()).to.not.reverted;
        expect(await schedule.entries()).to.equal(1);
      });
    });
    describe("missedDeadlines()", () => {
      it("Returns 0 before deadline", async () => {});
      it("(after deadline) Returns 0 if a confirmation was submitted within the window", async () => {});
      it("(after deadline) Returns 1 if no confirmation was submitted within the window", async () => {});
    });
  });
});
