var thecity = require('./thecity');

// best practice is to not store the token and key in source. place them in environment variables. 
thecity.init(process.env.CITY_TOKEN, process.env.CITY_KEY);

var userId = 3679;

thecity.user.family.list(userId, function(list) { console.log(list); });
return;

// example getting user information for user id 3679
thecity.user.get(userId, function(user) { console.log(user) });

//example getting 
thecity.user.addresses.list(userId, function(result) { 
  if(result && result.addresses.length > 0) {
    var addressId = result.addresses[0].id;
    console.log('looking up first address which is id ' + addressId);
    thecity.user.addresses.get(userId, addressId, function(address) {
      console.log(address);
    });
  }
});