pragma solidity ^0.4.4;

import "truffle/Assert.sol";

import "../contracts/Ballot.sol";

contract BallotTest {
    function test_trivial_test_case_should_run() public {
        Assert.equal(uint(1), uint(1), "Assertion should work");
    }

    function test_ballot_can_be_initiated() public {
        Ballot ballot = new Ballot(3);
        Assert.equal(ballot.numberOfProposals(), 3, "Number of proposals should be as initiated");
    }
}
