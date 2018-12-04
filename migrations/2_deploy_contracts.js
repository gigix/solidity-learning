var Auction = artifacts.require("./Auction.sol");
var Ballot = artifacts.require("./Ballot.sol");

module.exports = function(deployer) {
  deployer.deploy(Auction);
  deployer.deploy(Ballot, 3);
};
