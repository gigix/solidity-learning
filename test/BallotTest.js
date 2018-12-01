const Ballot = artifacts.require('Ballot')

contract('Ballot', async(accounts) => {
    let ballot

    beforeEach(async() => {
        ballot = await Ballot.new(3)
    })

    it('should initiate correctly', async() => {
        let chairPerson = await ballot.chairPerson()
        let numberOfProposals = await ballot.numberOfProposals()
        assert.equal(chairPerson, accounts[0], 'chair person should be the first account')
        assert.equal(numberOfProposals, 3, 'proposals should be initiated')
    })

    it('should be able to vote and determine winning proposal', async() => {
        ballot.vote(1)
        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 1, 'voted proposal should be winning')
    })

    it('should give chair person higher weight than others', async() => {
        let chairPerson = await ballot.chairPerson()
        let normalVoter = accounts[1]
        assert.notEqual(normalVoter, chairPerson)

        ballot.register([normalVoter])
        ballot.vote(1, {from: normalVoter})
        ballot.vote(2, {from: chairPerson})

        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 2, 'chair person voted proposal should be winning')
    })

    it('should only allow chair person to register voters', async() => {
        let normalVoter = accounts[1]

        try {
            await ballot.register([normalVoter], {from: normalVoter})
        } catch(error) {
            // do nothing
        }
        ballot.vote(1, {from: normalVoter})

        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 0, 'unregistered vote should be ignored')
    })

    it('should only allow registered voters to vote', async() => {
        let unregisteredVoter = accounts[1]
        let normalVoter = accounts[2]

        ballot.vote(1, {from: unregisteredVoter})
        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 0, 'unregistered vote should be ignored')

        ballot.register([normalVoter])
        ballot.vote(1, {from: normalVoter})
        winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 1, 'registered vote should be fine')
    })

    it('should not allow multi-votes', async() => {
        let normalVoter = accounts[1]
        let cheater = accounts[1]

        ballot.register([normalVoter, cheater])
        ballot.vote(1, {from: normalVoter})
        ballot.vote(2, {from: cheater})
        ballot.register([cheater])
        ballot.vote(2, {from: cheater})

        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 1, 'multi-votes should be ignored')
    })

})