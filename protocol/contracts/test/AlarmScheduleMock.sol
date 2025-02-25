// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../schedule-modules/AlarmSchedule.sol";

contract AlarmScheduleMock {
    using AlarmSchedule for AlarmSchedule.Schedule;

    AlarmSchedule.Schedule schedule;

    function init(
        uint alarmTime,
        uint8[] memory alarmDaysOfWeek,
        uint submissionWindow,
        int timezoneOffset
    ) public {
        schedule.init(
            alarmTime,
            alarmDaysOfWeek,
            submissionWindow,
            timezoneOffset
        );
        schedule.start();
    }

    function entries() public view returns (uint256) {
        return schedule.entries();
    }

    function missedDeadlines() public view returns (uint256) {
        return schedule.missedDeadlines();
    }

    function inSubmissionWindow() public view returns (bool) {
        return schedule.inSubmissionWindow();
    }

    function recordEntry() public {
        return schedule.recordEntry();
    }
}
