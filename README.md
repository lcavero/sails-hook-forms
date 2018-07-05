sails-hook-forms
==================

Implements formulary logic in Sails.

**Problem**: When you receive data in a **JSON API REST form**, you would like to filter the fields that will be used to create the model, and remove those that are restricted (some fields must be set by the server and not from the API).

**Solution**: Simple forms.

Install with:

    npm install sails-hook-forms

## Usage Example


First, create the formulary in /api/forms folder

```js
// /api/forms/user.js

// Expected body
/**
    {
        user: {
             name: "Cavero",
             email: "cavero@gmail.com",
             address: "12, Baker Street",
             phones: ["877-656565", "878-989898"]
        }
    }
*/

module.exports = {
  body: async function () {
    return {
        name: "user",
        type: "object",
        fields: [
            { name: "name" },
            { name: "email" },
            { name: "address" },
            { name: "phones" , type: "array" }
        ]
    };
  }
};
```

Then, in the controller...

```js
// /api/controllers/user/create.js
fn: async function (inputs, exits) {
    var proccessed = await sails.forms.user.process(this.req);
    /**
     processed =  {
          name: "Cavero",
          email: "cavero@gmail.com",
          address: "12, Baker Street",
          phones: ["877-656565", "878-989898"]
     }
    */
}
```


### More complex forms

```js

// Expected body
/**
    {
        users: [
            {
                name: "Cavero",
                email: "cavero@gmail.com",
                address: {
                    street: "Baker Street",
                    number: 12
                },
                phones: ["877-656565", "878-989898"],
                contacts: [
                    {
                        name: "Gerard",
                        email: "gerard@gmail.com"
                    },
                    {
                        name: "Joan",
                        email: "joan@gmail.com"
                    }
                ]
            }
        ]
    }
*/

// Formulary

// /api/forms/user.js
module.exports = {
  body: async function () {
    return {
        name: "users",
        type: "array",
        fields: [
            { name: "name" },
            { name: "email" },
            { 
                name: "address",
                type: "object",
                fields: [
                    { name: "street" },
                    { name: "number" }
                ]
            },
            { name: "phones" , type: "array" },
            { 
                name: "contacts", 
                type: "array",
                fields: [
                    { name: "name" },
                    { email: "email" }
                ]
            }
        ]
    };
  }
};
```

### Dinamyc forms
You can modify the fields of the form according to the type of request or anything you need

```js
// /api/forms/user.js
module.exports = {
  body: async function (req, user_role) {
      let basic_body = {
          name: "user",
          type: "object",
          fields: [
               { name: "name" },
               { name: "email" },
               { name: "address" },
               { name: "phones" , type: "array" }
           ]
       };
      if(req.method == "POST"){
          basic_body.fields.push({ name: "password" });
      }
      if(user_role == "ADMIN"){
          basic_body.fields.push({ name: "role" });
      }
      return basic_body;
  }
};
```

Then, in the controller...

```js
// /api/controllers/user/create.js
fn: async function (inputs, exits) {
    var role = "ADMIN";
    var proccessed = await sails.forms.user.process(this.req, role);
}
```