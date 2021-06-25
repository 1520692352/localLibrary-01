//控制器：从模型中获取请求的数据，创建一个 HTML 页面显示出数据，并将页面返回给用户，以便在浏览器中查看。

const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

const async = require('async');

exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.count({}, callback); // 传递一个空对象作为匹配条件以查找此集合的所有文档
        },
        book_instance_count: function(callback) {
            BookInstance.count({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count({}, callback);
        },
        genre_count: function(callback) {
            Genre.count({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: '本地图书馆主页', error: err, data: results });
    });
};

// 显示完整的藏书列表
exports.book_list = function (req,res,next) {
    Book.find({},'title author')
        .populate('author')
        .exec(function (err,list_books) {
            if (err){return next(err);}
            //成功，所以显示，传递title和book_list两个变量
            res.render('book_list',{title:'书籍列表',book_list:list_books});
        });
};

// 为每位藏书显示详细信息的页面
exports.book_detail = function (req,res,next) {
    async.parallel({
            book:function(callback) {
                Book.findById(req.params.id)
                    .populate('author')
                    .populate('genre')
                    .exec(callback);
            },
            book_instance:function(callback){
                BookInstance.find({'book':req.params.id})
                    .exec(callback);
            },
    },function (err,results) {
        if (err){return next(err);}
        if (results.book==null){
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail',{title:'标题',book:results.book,book_instances:results.book_instance});
        });
};

// 由 GET 显示创建藏书的表单
exports.book_create_get = function(req, res, next) {
    // 获取所有的作者和体例，我们可以用它们来添加到我们的书中。
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });

};

// 由 POST 处理藏书创建操作
exports.book_create_post = [
    // 将类型转换为数组。
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // 验证字段.
    body('title', '标题不能为空。').isLength({ min: 1 }).trim(),
    body('author', '作者不能是空的。').isLength({ min: 1 }).trim(),
    body('summary', '摘要不能为空。').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN不能为空').isLength({ min: 1 }).trim(),

    // 清理字段(使用通配符)。
    sanitizeBody('*').trim().escape(),
    sanitizeBody('genre.*').escape(),
    // 处理验证和清理后的请求
    (req, res, next) => {
        // 从请求中提取验证错误。
        const errors = validationResult(req);

        // 创建一个带有转义和修剪数据的Book对象。
        var book = new Book(
            { title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre
            });

        if (!errors.isEmpty()) {
            // 有错误。再次使用经过消毒的值/错误消息呈现表单。
            // 获取所有作者和种类的表单。
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // 将我们选择的体裁标记为勾选
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // 表单中的数据是有效的。保存书籍。
            book.save(function (err) {
                if (err) { return next(err); }
                //成功-重定向到新书记录。
                res.redirect(book.url);
            });
        }
    }
];

// 由 GET 显示删除藏书的表单
exports.book_delete_get = (req, res) => { res.send('未实现：藏书删除表单的 GET'); };

// 由 POST 处理藏书删除操作
exports.book_delete_post = (req, res) => { res.send('未实现：删除藏书的 POST'); };

// 由 GET 显示更新藏书的表单
exports.book_update_get = function(req, res, next) {

    // 获取表单的书籍、作者和流派。
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('book_form', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book });
    });

};

// 由 POST 处理藏书更新操作
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
            { title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
                _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thebook.url);
            });
        }
    }
];
