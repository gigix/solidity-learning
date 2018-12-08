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

    enum Stage {Init, Reg, Vote, Done}

    event VotingFinished(uint winningProposal);

    Proposal [] proposals;
    mapping(address => Voter) voters;
    address public chairPerson;
    Stage public stage = Stage.Init;

    modifier onlyBy(address _account) {
        require(msg.sender == _account);
        _;
    }

    modifier onlyAtStage(Stage _stage) {
        require(stage == _stage);
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

    function startRegistration() public onlyAtStage(Stage.Init) onlyBy(chairPerson) {
        stage = Stage.Reg;
    }

    function startVoting() public onlyAtStage(Stage.Reg) onlyBy(chairPerson) {
        stage = Stage.Vote;
    }

    function finishVoting() public onlyAtStage(Stage.Vote) onlyBy(chairPerson) {
        stage = Stage.Done;
        emit VotingFinished(winningProposal());
    }

    function vote(uint _indexOfProposal) public onlyAtStage(Stage.Vote) {
        Voter storage voter = voters[msg.sender];
        if(voter.alreadyVoted) {
            return;
        }

        proposals[_indexOfProposal].voteCount += voter.weight;
        voter.alreadyVoted = true;
    }

    function register() public onlyAtStage(Stage.Reg) {
        address voterAddress = msg.sender;
        if(voters[voterAddress].weight == 0) {
            voters[voterAddress].weight = 1;
        }
    }

    function winningProposal() constant public onlyAtStage(Stage.Done) returns(uint) {
        uint candidate = 0;
        for(uint i = 0; i < numberOfProposals(); i++) {
            if(proposals[i].voteCount > proposals[candidate].voteCount) {
                candidate = i;
            }
        }
        return proposals[candidate].id;
    }
}