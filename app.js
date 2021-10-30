const express = require('express')
const { insertToDB, getAll, deleteObject, getDocumentById, updateDocument, findProductsByCategory, findProductsByProductName, checkRangeOfNumber } = require('./databaseHandler')
const app = express()

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))

const path = require('path')
const { info } = require('console')
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

// Static Files
app.use(express.static('public'))
app.use('/img', express.static(__dirname + 'public/images'))

app.get('/update/:id', async (req, res) => {
    const idValue = req.params.id
    //lay thong tin cu cua sp cho nguoi dung xem, sua
    const productToEdit = await getDocumentById(idValue, "Products")
    //hien thi ra de sua
    res.render("edit", { product: productToEdit })
})

app.post('/update/:id', async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const category = req.body.txtCategory
    const price = req.body.txtPrice
    const url = req.body.txtURL
    let updateValues = { $set: { name: name, price: price, cat: category, picURL: url } };

    // //Kiểm tra tên sản phẩm
    // if(name ==""){
    //     let product = {};
    //     product._id = id;
    //     product.price = price;
    //     product.picURL = url;
    //     res.render('edit', {product, nameErr: 'Please Enter Product Name!' })
    //     return;
    // }
    // //Kiểm tra number có nằm trong khoảng giá trị
    let error = await checkRangeOfNumber(0,100000,price);
    if(error != ""){
        let product = {};
        product._id = id;
        product.name = name;
        product.picURL = url;
        res.render('edit',{product, priceErr: error });
        return;
    }

    //Kiểm tra URL có để trống.
    if(url == ""){
        let product = {};
        product._id = id;
        product.name = name;
        product.price = price;
        res.render('edit', {product, picError: 'Please Enter URL!' })
       return;
    }
    //Kiểm tra xem url có kết thúc bằng đuôi .png
    // console.log("Check png")
    // console.log(url.endsWith('png'))

    if (url.endsWith('.png')==false) {
        let product = {};
        product._id = id;
        product.name = name;
        product.price = price;
        res.render('edit', {product, picError: 'The image was not png file!' })
        return;
    } 
    else {
        await updateDocument(id, updateValues, "Products")
        res.redirect('/')
    }})



app.get('/', async (req, res) => {
    var result = await getAll("Products")
    res.render('home', { products: result })
})

app.get('/allproducts', async (req, res) => {
    var all = await getAll("Products")
    console.log(all)
    res.render('allproducts', { products: all })
})
app.get('/allproducts', async (req, res) => {
    var result = await getAll("Products")
    res.render('allproducts', { product: result })
})

app.get('/delete/:id', async (req, res) => {
    const idValue = req.params.id
    //viet ham xoa object dua tren id
    await deleteObject(idValue, "Products")
    res.redirect('/allproducts')
})

app.get('/create',(req,res)=>{
    res.render('create')
})
app.post('/create', async (req, res) => {
    const name = req.body.txtName
    const category = req.body.txtCategory;
    const price = req.body.txtPrice
    const url = req.body.txtURL;
    if (url.length == 0) {
        
        res.render('create', { name: name, price: price, cat: category, picError: 'URl require!' })
    } else {
        //xay dung doi tuong insert
        const obj = { name: name, price: price, picURL: url, cat: category }
        //goi ham de insert vao DB
        await insertToDB(obj, "Products")
        res.redirect('/')
    }
})

app.post('/searchByCategory', async (req, res) => {
    const category = req.body.txtCategory
    console.log('Category: ', category)
    if (category == "all") {
        var result = await getAll("Products")
        res.render('home', { products: result })
    } else {
        var result = await findProductsByCategory(category)
        res.render('home', { products: result })
    }
})

app.get('/', (req, res) => {
    var today = new Date();
    var name = "Bin_Shop"
    res.render('home', { ht: today, name: name, ds: ds })
})

app.post('/searchByProductName', async (req, res) => {
    const name = req.body.name
    console.log('Product name: ', name)
    if (name == "") {
        var result = await getAll("Products")
        res.render('home', { products: result, err:"Please input value!!!" })
    } else {
        var result = await findProductsByProductName(name)
        res.render('home', { products: result })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT)
console.log('Server is running!')

