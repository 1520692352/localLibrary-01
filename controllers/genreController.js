const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

//控制器：从模型中获取请求的数据，创建一个 HTML 页面显示出数据，并将页面返回给用户，以便在浏览器中查看。

// 显示完整的藏书类型列表
exports.genre_list = function (req, res, next) {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_genre) {
            res.render('genre_list', {title: '书籍种类', genre_list: list_genre})
        });
};

// 为每位藏书类型显示详细信息的页面
exports.genre_detail = function (req, res, next) {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },

        genre_books: function (callback) {
            Book.find({'genre': req.params.id})
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre == null) {
            //no null
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        //successful
        //所需种类记录的 ID ，在 URL 的末尾编码，并根据路由定义（/genre/:id）自动提取。
        // 通过请求参数（req.params.id）在控制器内访问 ID。它在Genre.findById()中用于获取当前种类。
        // 它还用于获取符合当前种类的所有Book对象，就是在种类字段中具有种类ID的那些 Book.find({ 'genre': req.params.id })。
        res.render('genre_detail', {title: '种类详情', genre: results.genre, genre_books: results.genre_books});
    });
};

// 由 GET 显示创建藏书类型的表单
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', {title: '创建种类'})
};

// 由 POST 处理藏书类型创建操作
exports.genre_create_post = [
    //验证name字段是否为空,验证器
    body('name', '需要类型名称').isLength({min: 1}).trim(),
    //清理空格并且转义字段，清理器
    sanitizeBody('name').trim().escape(),
    //处理验证和清理后的请求，中间函数
    (req,res,next)=>{
        //从请求中提取验证信息
        const errors = validationResult(req);
        //使用转义和清理后的数据创建对象
        let genre = new Genre(
            {
                name:req.body.name
            }
        );
        if (!errors.isEmpty()){
            //有错误，使用输入的信息再次呈现表单
            res.render('genre_form',{title:'创建表单',genre:genre,errors:errors.array()});
            return;
        }
        else {
            //表单中的数据是有效的
            //检查是否存在同名的类型
            Genre.findOne({'name':req.body.name})
                .exec(function (err,found_genre) {
                    if (err){return next(err);}
                    if (found_genre){
                        //种类存在，重定向到其详细页面
                        res.redirect(found_genre.url);
                    }
                    else {
                        genre.save(function (err) {
                            if (err){return next(err);}
                            //类型保存，重定向到种类详情页面
                            res.redirect(genre.url)
                        })
                    }
                })
        }
    }
];

// 由 GET 显示删除藏书类型的表单
exports.genre_delete_get = (req, res) => {
    res.send('未实现：藏书类型删除表单的 GET');
};

// 由 POST 处理藏书类型删除操作
exports.genre_delete_post = (req, res) => {
    res.send('未实现：删除藏书类型的 POST');
};

// 由 GET 显示更新藏书类型的表单
exports.genre_update_get = (req, res) => {
    res.send('未实现：藏书类型更新表单的 GET');
};

// 由 POST 处理藏书类型更新操作
exports.genre_update_post = (req, res) => {
    res.send('未实现：更新藏书类型的 POST');
};