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

function getBalance(statement){

    const balance = statement.reduce((acc,operation) => {
        if(operation.type === 'credit'){
            return acc + operation.value
        }
        return acc - operation.value
    
    },0)

    return balance
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

app.post('/deposit',verifyIfExistAccountCPF, (req,res)=>{
    const {description, amount} = req.body
    const {customer} = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()

})

app.post('/withdraw',verifyIfExistAccountCPF, (req,res)=>{
    const {amount} = req.body
    const {customer} = req


    const balance = getBalance(customer.statement)


    if(balance < amount){
        return res.status(400).json({error: 'Insufficient funds'})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()

})


app.get('/statement/date', verifyIfExistAccountCPF, (req, res) => {
   
    const {customer} = req
    const {date} = req.query

    const dateFormat = new Date(date + " 00:00")

    const statement = customer.statement.filter(
        (statement) => 
            statement.created_at.toDateString() ===  new Date(dateFormat).toDateString()
    )    
    

    return res.status(200).json(customer.statement)
    
})

app.put('/account', verifyIfExistAccountCPF, (req, res) => {
    const {name} = req.body
    const {customer} = req

    customer.name = name

    return res.status(200).send()
})

app.get('/account', verifyIfExistAccountCPF, (req, res) => {
    const {customer} = req

    return res.status(200).json(customer)
})

app.delete('/account', verifyIfExistAccountCPF, (req, res) => {
    const {customer} = req

    const index = customers.indexOf(customer)

    customers.splice(index,1)

    return res.status(204).send()
})

app.listen(3333, () => {
    console.log('Server started on port 3333');
})