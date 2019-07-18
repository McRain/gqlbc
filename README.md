# gqlbc
GraphQL Client library for browsers 

## Usage

###### Query:

`const res = await GraphQLClient.Get({
        orders: [
            {
                _args: {
                    id: "order_id"
                }
            },
            "_id", "count", "price", "info", "state", "created",
            {
                category: ['_id', 'name']
            }
        ]
    });
    
    if (!res || res.error) {
        console.log("error");
        return;
    }`
    
    
###### Mutation

`const res = await GraphQLClient.Set({
        saveUser: [
            {
                _args: {
                    id: "user_id",
                    level: 10
                }
            }
        ]
    });
    console.log(res);`
