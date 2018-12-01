pragma solidity ^0.4.4;

contract Ballot {
    struct Proposal {
        uint id;
        uint voteCount;
    }

    Proposal [] proposals;

    constructor(uint _numberOfProposals) public {
        proposals.length = _numberOfProposals;
        for(uint i = 0; i < _numberOfProposals; i++) {
            proposals[i].id = i;
        }
    }

    function numberOfProposals() constant public returns(uint) {
        return proposals.length;
    }

    function vote(uint _indexOfProposal) public {
        proposals[_indexOfProposal].voteCount ++;
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