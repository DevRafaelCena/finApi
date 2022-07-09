const express = require('express');
const {v4: uuidv4} = require('uuid')

const app = express();
app.use(express.json());

const customers =[]

// Middleware

function verifyIfExistAccountCPF(req,res,next){  
    const {cpf} = req.headers
    const customer = customers.find((c) => c.cpf === cpf)

    if(!customer){
        return res.status(400).json({error: 'Customer not found'})
    }

    req.customer = customer

    return next()
    
}



app.post("/account", (req, res) => {
    const {cpf,name} = req.body;

    const customerAlreadyExists = customers.find(customer => customer.cpf === cpf);

    if(customerAlreadyExists){
        return res.status(400).json({error: "Customer already exists"});
    }

    customers.push({
        cpf,
        name,
        id: uuidv4() ,
        statement:[]
    })

    return res.status(201).send()


})

app.get('/statement', verifyIfExistAccountCPF, (req, res) => {
   
    const {customer} = req
    

    return res.status(200).json(customer.statement)
    
})


app.listen(3333, () => {
    console.log('Server started on port 3333');
})