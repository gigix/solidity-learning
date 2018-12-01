pragma solidity ^0.4.4;

import "truffle/Assert.sol";

import "../contracts/Ballot.sol";

contract BallotTest {
    Ballot ballot;

    function beforeEach() public {
        ballot = new Ballot(3);
    }

    function test_trivial_test_case_should_run() public {
        Assert.equal(uint(1), uint(1), "Assertion should work");
    }

    function test_ballot_can_be_initiated() public {
        Assert.equal(ballot.numberOfProposals(), 3, "Number of proposals should be as initiated");
        Assert.equal(ballot.chairPerson(), msg.sender, "Chair person should be initiated");
    }

    function test_ballot_can_be_voted() public {
        ballot.vote(1);
        Assert.equal(ballot.winningProposal(), 1, "Voted proposal should win");
    }
}
