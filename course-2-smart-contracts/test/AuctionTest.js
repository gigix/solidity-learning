const Auction = artifacts.require('Auction')

contract('Auction', async(accounts) => {
    let auction
    let owner

    beforeEach(async() => {
        owner = accounts[0]
        auction = await Auction.new()
    })

    it('should initiate correctly', async() => {
        let beneficiary = await auction.beneficiary()
        assert.equal(owner, beneficiary)

        let firstItem = await auction.items(0)
        let secondItem = await auction.items(1)
        let thirdItem = await auction.items(2)
        assert.equal(firstItem, 0)
        assert.equal(secondItem, 1)
        assert.equal(thirdItem, 2)
    })

    it('should register multiple bidders', async() => {
        let firstBidder = accounts[1]
        let secondBidder = accounts[2]

        auction.register({from: firstBidder})
        auction.register({from: secondBidder})

        let [remainingTokens, personId, registeredBidderAddress] = await auction.getPersonDetails(0)
        assert.equal(firstBidder, registeredBidderAddress)
    })

    it('should allow bidding', async() => {
        let bidder = accounts[1]
        auction.register({from: bidder})
        auction.bid(0, 2, {from: bidder})

        let [remainingTokens, personId, registeredBidderAddress] = await auction.getPersonDetails(0)
        assert.equal(3, remainingTokens)
    })

    it('should revert bidding if prerequisites are not met', async() => {
        let bidder = accounts[1]
        auction.register({from: bidder})

        try {
            await auction.bid(0, 6, {from: bidder})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
        let [remainingTokens, personId, registeredBidderAddress] = await auction.getPersonDetails(0)
        assert.equal(5, remainingTokens)

        try {
            await auction.bid(3, 2, {from: bidder})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
        [remainingTokens, personId, registeredBidderAddress] = await auction.getPersonDetails(0)
        assert.equal(5, remainingTokens)

        auction.bid(0, 5, {from: bidder})

        try {
            await auction.bid(0, 0, {from: bidder})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }
        [remainingTokens, personId, registeredBidderAddress] = await auction.getPersonDetails(0)
        assert.equal(0, remainingTokens)
    })

    it('should only allow owner to reveal winners', async() => {
        let bidder = accounts[1]
        auction.register({from: bidder})

        auction.bid(1, 2, {from: bidder})

        try {
            await auction.revealWinners({from: bidder})
            assert.fail('exception expected')
        } catch(error) {
            assert( /invalid opcode|revert/.test(error), 'the error message should be invalid opcode or revert' )
        }

        auction.revealWinners()
        let winner = await auction.winners(1)
        assert.equal(bidder, winner)
    })
})
