const Author = require('../models/author');
const async = require('async');
const Book = require('../models/book');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

//控制器：从模型中获取请求的数据，创建一个 HTML 页面显示出数据，并将页面返回给用户，以便在浏览器中查看。

// 显示完整的作者列表
exports.author_list = function (req,res,next) {
    Author.find()
        .sort([['family_name','ascending']])
        .exec(function (err,list_authors) {
            res.render('author_list',{title:'作者列表',author_list:list_authors});
        });
};

// 为每位作者显示详细信息的页面
exports.author_detail = function (req,res,next) {
    async.parallel({
        author:function (callback) {
            Author.findById(req.params.id)
                .exec(callback);
        },
        authors_books:function (callback) {
            Book.find({'author':req.params.id},'title summary')
                .exec(callback);
        }
    },function (err,results) {
        if (err){return next(err);}
        if (results.author == null){
            let err = new Error('作者未找到')
            err.status = 404;
            return next(err)
        }
        res.render('author_detail',{title:'作者详情',author:results.author,author_books:results.authors_books})
    });
};

// 由 GET 显示创建作者的表单
exports.author_create_get = function (req,res,next) {
    res.render('author_form',{title:'创建作者'})
};

// 由 POST 处理作者创建操作
exports.author_create_post = [
    //验证字段
    body('first_name').isLength({min:1}).trim().withMessage('必须指定名字')
        .isAlphanumeric().withMessage('名字包含非法字符'),
    body('family_name').isLength({min:1}).trim().withMessage('必须有姓')
        .isAlphanumeric().withMessage('姓中包含非法字符'),
    body('date_of_birth','无效出生日期').optional({checkFalsy:true}).isISO8601(),
    body('date_of_death','无效死亡日期').optional({checkFalsy:true}).isISO8601(),

    //清理字段
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    //处理请求
    (req, res, next) => {

        // 从请求中提取验证错误。
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // 有错误。再次使用经过消毒的值/错误消息呈现表单。
            res.render('author_form', {title: '创建作者', author: req.body, errors: errors.array()});
            return;
        } else {
            // 表单中的数据是有效的.
            // 使用转义和修剪过的数据创建Author对象。
            var author = new Author(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            author.save(function (err) {
                if (err) {
                    return next(err);
                }
                // 成功-重定向到新的作者记录。
                res.redirect(author.url);
            });
        }
    }
];

// 由 GET 显示删除作者的表单
exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.redirect('/catalog/authors');
        }
        // Successful, so render.
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

// 由 POST 处理作者删除操作
exports.author_delete_post = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.body.authorid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.authors_books.length > 0) {
            // 作者有书。以与 GET 路由相同的方式呈现。
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            // 作者没有书。删除对象并重定向到作者列表。
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // 成功-转到作者列表
                res.redirect('/catalog/authors')
            })
        }
    });
};

// 由 GET 显示更新作者的表单
exports.author_update_get = (req, res) => { res.send('未实现：作者更新表单的 GET'); };

// 由 POST 处理作者更新操作
exports.author_update_post = (req, res) => { res.send('未实现：更新作者的 POST'); };