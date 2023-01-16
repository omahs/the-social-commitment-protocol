# An Interactive and Social Productivity Protocol

The Social Commitment Protocol is a generalized productivity protocol with an open and extendible architecture allowing for individual goals and 'commitments' to be enforced in a social and game-like manner.

At the core of the protocol is the idea of a "Commitment". A user making a commitment is signing a transaction as an agreement that they will do whatever the commitment describes. The base form of a commitment only has a few simple attributes, but can be extended and customized to allow for all sorts fun and unique functionality that is only achievable through smart contracts.

# What's possible with the protocol?
* ToDo / goal setting apps that donate or temporarily lock your money if you fail to meet your deadlines / goals
* Social apps with credit systems to reward peers for their achievements
* Alarm clock 'pool' joinable with friends that force you to wake up on time, else you risk your money being transferred to your friends.
* Public accountability systems for public-figures to officiate their commitments/promises
* Public courts to judge commitment proofs through social consensus

# Architecture
## Base Commitment
```solidity
interface IBaseCommitment {
    event CommitmentCreated(string description);
    event ConfirmationSubmitted();
    event ProofSubmitted(string uri, uint proofId);
    event StatusChanged(Status from, Status to);
    
    Status public status
    string public name;
    address public owner;

    function submitConfirmationWithProof(string memory) external;
    function submitConfirmation() external;
    function pause() external;
    function terminate() external;
}
  ```
A base commitment acts as a minimal structure for creating and updating the state of your commitments. The BaseCommitment provides functionality to confirm completion of your commitment, and optionally submit an external link as a proof of completion.

## Scheduled Commitments
```solidity
enum ScheduleType {
    NONE,
    DEADLINE,
    ALARM,
    INTERVAL
}

interface IScheduledCommitment is IBaseCommitment {
    event DeadlineMissed();
    ScheduleType public scheduleType;
    uint submissionWindow;

    function missedDeadlines() external view;
    function inSubmissionWindow() external view;
}
```
Commitments can be extended with scheduling logic that only allows submissions to occur within 'submission windows'. Schedule modules also track 'missedDeadlines' which can be read by enforcement modules to penalize and/or reward commitments.

## Enforcement Modules
```solidity
interface EnforcementModule {
    event UserJoined(uint id);
    event UserExit(uint id);
    
    mapping (uint => ScheduledCommitment) commitments;
    mapping (address => uint) userEntries;

    function join(DeadlineCommitment commitment, bytes calldata joinData) public payable virtual;
    function penalize(address user) public virtual;
    function exit() public virtual;
}
```
Enforcement modules are a core component to the protocol that facilitate commitment interactivity. Custom enforcement modules can be created to facilitate pooled commitments with reward structures and penalization logic. This may include logic for pool members to vote on each other's 'proof of completion', logic to time-lock funds if deadlines are missed, and can if implement achievement 'credit' systems where users get more reputation for posting commitments and successfully completing them. The possibilities here are endless.

## Composed Commitment Extension Examples

__ToDo or Die__  
This commitment extension acts as a way to forcefully incentivize yourself to get your goals and ToDo items accomplished. You describe what is is you need to get done, then set a deadline. If you fail to mark it as completed in time, there will be automated penalties. Penalties are customizable but may include:
* Timelocking your funds in the smart contract
* Automatically donating your funds to preset addresses

__Alarm Clock Task Pool__ (in development)  
This commitment extension serves as a way to help individuals force themselves to wake up earlier. When joining the pool, the user selects the following:
* Desired wakeup time
* Days of the week to enforce the alarm
* Any amount of money the user wants to put at stake to force themselves to abide by the alarm
* A description of a task they must complete to confirm they've woken up, which is provable by taking a picture

Each morning, a user in the pool must submit a URL to the pool, which is simply a link to an externally hosted image of them completing the task. Failing to confirm their wakeup by their alarm time can result in a penalty which is deducted from their stake and sent to the other members of the pool. To prevent re-used images and 'fake' proofs, users can vote on the legitimacy of others' proofs. A successfully contested proof can result in a user losing a portion of their stake to the pool.

__Commitment Bets__  (in development)  
A commitment bet is made between two users, who must both put up the same amount of money and provide a written description of the task they must complete, or conditions that must be met for their side of the deal to be held up. Both parties must submit their proof of completion to the bet contract before the deadline, else their funds may be sent to the other party. If both proofs are submitted on time, but the parties do not sign off on the outcome of the bet, the bet can be taken to a [public decentralized court](https://court.aragon.org/#/dashboard) for resolution.

# Setup
This repo uses the yarn package manager, and will not work with yarn v1

* Ensure the correct version of yarn is being used:
```
yarn set version berry
```

* Install dependencies:
```
yarn install
```

## Build and Test the protocol

* Compile smart contracts and test
```
yarn test-protocol
```

## Development

This project is setup as a monorepo including the generalized protocol under the "protocol" package, and a web app interface under the "interfaces" package.

This is a very young project in active development, and the protocol + APIs are rapidly evolving.


# Contribution

This is an open source project and I welcome anyone who would like to contribute. For more information about the project and/or the development work being done, feel free to message me on telegram @jaxernst. 

