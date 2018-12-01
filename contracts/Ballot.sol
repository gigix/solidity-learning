pragma solidity ^0.4.4;

contract Ballot {
    uint public numberOfProposals;

    constructor(uint _numberOfProposals) public {
        numberOfProposals = _numberOfProposals;
    }
}