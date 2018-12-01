pragma solidity ^0.4.4;

contract Ballot {
    struct Proposal {
        uint id;
        uint voteCount;
    }

    struct Voter {
        uint weight;
        bool alreadyVoted;
    }

    Proposal [] proposals;
    mapping(address => Voter) voters;
    address public chairPerson;

    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    constructor(uint _numberOfProposals) public {
        chairPerson = msg.sender;
        voters[msg.sender].weight = 2;

        proposals.length = _numberOfProposals;
        for(uint i = 0; i < _numberOfProposals; i++) {
            proposals[i].id = i;
        }
    }

    function numberOfProposals() constant public returns(uint) {
        return proposals.length;
    }

    function vote(uint _indexOfProposal) public {
        Voter storage voter = voters[msg.sender];
        if(voter.alreadyVoted) {
            return;
        }

        proposals[_indexOfProposal].voteCount += voter.weight;
        voter.alreadyVoted = true;
    }

    function register(address[] _voters) public onlyBy(chairPerson) {
        for(uint i = 0; i < _voters.length; i++) {
            address voterAddress = _voters[i];
            if(voters[voterAddress].weight == 0) {
                voters[voterAddress].weight = 1;
            }
        }
    }

    function winningProposal() constant public returns(uint) {
        uint candidate = 0;
        for(uint i = 0; i < numberOfProposals(); i++) {
            if(proposals[i].voteCount > proposals[candidate].voteCount) {
                candidate = i;
            }
        }
        return proposals[candidate].id;
    }
}