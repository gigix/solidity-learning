const Ballot = artifacts.require('Ballot')

contract('Ballot', async(accounts) => {
    let ballot
    let Stages = {
        Init: 0,
        Reg: 1,
        Vote: 2,
        Done: 3
    }

    beforeEach(async() => {
        ballot = await Ballot.new(3)
    })

    it('should initiate correctly', async() => {
        let chairPerson = await ballot.chairPerson()
        let numberOfProposals = await ballot.numberOfProposals()
        let stage = await ballot.stage()

        assert.equal(chairPerson, accounts[0], 'chair person should be the first account')
        assert.equal(numberOfProposals, 3, 'proposals should be initiated')
        assert.equal(stage, Stages.Init, 'stage should be initiated')
    })

    it('should be able to vote and determine winning proposal', async() => {
        ballot.startRegistration()
        ballot.startVoting()

        ballot.vote(1)
        ballot.finishVoting()

        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 1, 'voted proposal should be winning')
    })

    it('should only allow getting result at DONE stage', async() => {
        try {
            await ballot.winningProposal()
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        ballot.startRegistration()
        try {
            await ballot.winningProposal()
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        ballot.startVoting()
        try {
            await ballot.winningProposal()
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        ballot.finishVoting()
        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 0, 'now the stage is fine')
    })

    it('should give chair person higher weight than others', async() => {
        let chairPerson = await ballot.chairPerson()
        let normalVoter = accounts[1]
        assert.notEqual(normalVoter, chairPerson)

        ballot.startRegistration()
        ballot.register({from: normalVoter})
        ballot.startVoting()

        ballot.vote(1, {from: normalVoter})
        ballot.vote(2, {from: chairPerson})

        ballot.finishVoting()
        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 2, 'chair person voted proposal should be winning')
    })

    it('should only allow registration in REG stage', async() => {
        let normalVoter = accounts[1]

        try {
            await ballot.register({from: normalVoter})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        ballot.startRegistration()
        ballot.register({from: normalVoter})

        ballot.startVoting()
        try {
            await ballot.register({from: normalVoter})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
    })

    it('should only allow voting at VOTE stage', async() => {
        try {
            await ballot.vote(0)
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        ballot.startRegistration()
        try {
            await ballot.vote(0)
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        ballot.startVoting()
        ballot.vote(1)

        ballot.finishVoting()
        try {
            await ballot.vote(0)
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 1, 'only 1 valid voting')
    })

    it('should only allow registered voters to vote', async() => {
        let unregisteredVoter = accounts[1]
        let normalVoter = accounts[2]

        ballot.startRegistration()
        ballot.register({from: normalVoter})

        ballot.startVoting()
        ballot.vote(1, {from: unregisteredVoter})

        ballot.finishVoting()
        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 0, 'unregistered vote should be ignored')
    })

    it('should not allow multi-votes', async() => {
        let normalVoter = accounts[1]
        let cheater = accounts[1]

        ballot.startRegistration()
        ballot.register({from: normalVoter})
        ballot.register({from: cheater})

        ballot.startVoting()
        ballot.vote(1, {from: normalVoter})
        ballot.vote(2, {from: cheater})
        ballot.vote(2, {from: cheater})

        ballot.finishVoting()
        let winningProposal = await ballot.winningProposal()
        assert.equal(winningProposal, 1, 'multi-votes should be ignored')
    })

    it('should not allow non-chair person to transit stages', async() => {
        let chairPerson = accounts[0]
        let normalPerson = accounts[1]

        try {
            await ballot.startRegistration({from: normalPerson})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
        ballot.startRegistration({from: chairPerson})

        try {
            await ballot.startVoting({from: normalPerson})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
        ballot.startVoting({from: chairPerson})

        try {
            await ballot.finishVoting({from: normalPerson})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
        ballot.finishVoting({from: chairPerson})
    })
})