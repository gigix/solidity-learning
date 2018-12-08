App = {
  web3Provider: null,
  contracts: {},

  init: function() {
      return App.initWeb3();
  },

  initWeb3: async function() {
//      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
//      web3 = new Web3(App.web3Provider);
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Ballot.json", function(ballot) {
      App.contracts.Ballot = TruffleContract(ballot);
      App.contracts.Ballot.setProvider(App.web3Provider);
      App.bindEvents();
      return App.render();
    });
  },

  bindEvents: function() {
    $(document).on('click', '#startVoting', App.handleStartRegistration);
  },

  handleStartRegistration: function() {
    App.contracts.Ballot.deployed().then(function(ballot) {
      return ballot.startRegistration({from: App.account});
    }).then(function(result) {
      console.log(result);
      App.render();
    });
  },

  render: function() {
    var ballot;

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Ballot.deployed().then(function(ballot) {
      return ballot.chairPerson();
    }).then(function(chairPerson) {
      console.log(chairPerson);
      $("#chairPerson").html("Chair Person: " + chairPerson);
    });

    App.contracts.Ballot.deployed().then(function(ballot) {
      return ballot.stage();
    }).then(function(stage) {
      console.log(stage);
      $("#stage").html("Stage: " + stage);
    });

    // Load contract data
    App.contracts.Ballot.deployed().then(function(ballot) {
      return ballot.numberOfProposals();
    }).then(function(numberOfProposals) {
      console.log(numberOfProposals)
      var proposals = $("#proposals");
      proposals.empty();

      for (var i = 1; i <= numberOfProposals; i++) {
        proposals.append("<p>" + i + "<button></button>" + "</p>")
      }
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
