import { BigNumberish } from "ethers";
import type { BaseCommitment, TimelockingDeadlineTask } from "@scp/protocol/typechain-types";
import { BaseCommitment__factory, TimelockingDeadlineTask__factory } from "@scp/protocol/typechain-types";
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const commitmentTypeVals: Record<CommitmentType, number> = {
    BaseCommitment: 0,
    TimelockingDeadlineTask: 1
}

export const commitmentValToType: Record<number, CommitmentType> = {
    0: "BaseCommitment",
    1: "TimelockingDeadlineTask"
}

export type CommitmentType = 
    "BaseCommitment" | 
    "TimelockingDeadlineTask" 

export type CommitmentContractTypes = {
    "BaseCommitment": BaseCommitment,
    "TimelockingDeadlineTask": TimelockingDeadlineTask
}

export const commitmentFactories = {
    "BaseCommitment": BaseCommitment__factory,
    "TimelockingDeadlineTask": TimelockingDeadlineTask__factory
}

export type InitializationTypes = {
    "BaseCommitment": { name: string, description: string}
    "TimelockingDeadlineTask": { 
        deadline: BigNumberish, 
        submissionWindow: BigNumberish,
        timelockDuration: BigNumberish,
        taskDescription: BigNumberish
    }
}

export const solidityInitializationTypes = {
    "BaseCommitment": ["string", "string"],
    "TimelockingDeadlineTask": ["uint256", "uint256", "string", "string"],
}

export enum CommitStatus {
    ACTIVE,
    PAUSED,
    COMPLETE,
    CANCELLED,
}

export enum ScheduleModule {
    NONE,
    DEADLINE,
    ALARM,
    INTERVAL
}

export enum PenaltyModule {
    TIMELOCK,
    DONATION
}


