#! /usr/bin/env node

console.log('这个脚本将一些测试书籍、作者、流派和书籍实例填充到数据库中。指定数据库为参数-例如:populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// 获取在命令行上传递的参数
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('Error:你需要指定一个有效的mongodb URL作为第一个参数');
    return
}
*/
var async = require('async')
var Book = require('./models/book')
var Author = require('./models/author')
var Genre = require('./models/genre')
var BookInstance = require('./models/bookinstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var authors = []
var genres = []
var books = []
var bookinstances = []

function authorCreate(first_name, family_name, d_birth, d_death, cb) {
    authordetail = {first_name: first_name, family_name: family_name}
    if (d_birth != false) authordetail.date_of_birth = d_birth
    if (d_death != false) authordetail.date_of_death = d_death

    var author = new Author(authordetail);

    author.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Author: ' + author);
        authors.push(author)
        cb(null, author)
    });
}

function genreCreate(name, cb) {
    var genre = new Genre({name: name});

    genre.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Genre: ' + genre);
        genres.push(genre)
        cb(null, genre);
    });
}

function bookCreate(title, summary, isbn, author, genre, cb) {
    bookdetail = {
        title: title,
        summary: summary,
        author: author,
        isbn: isbn
    }
    if (genre != false) bookdetail.genre = genre

    var book = new Book(bookdetail);
    book.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Book: ' + book);
        books.push(book)
        cb(null, book)
    });
}


function bookInstanceCreate(book, imprint, due_back, status, cb) {
    bookinstancedetail = {
        book: book,
        imprint: imprint
    }
    if (due_back != false) bookinstancedetail.due_back = due_back
    if (status != false) bookinstancedetail.status = status

    var bookinstance = new BookInstance(bookinstancedetail);
    bookinstance.save(function (err) {
        if (err) {
            console.log('ERROR CREATING BookInstance: ' + bookinstance);
            cb(err, null)
            return
        }
        console.log('New BookInstance: ' + bookinstance);
        bookinstances.push(bookinstance)
        cb(null, book)
    });
}


function createGenreAuthors(cb) {
    async.series([
            function (callback) {
                authorCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback);
            },
            function (callback) {
                authorCreate('Ben', 'Bova', '1932-11-8', false, callback);
            },
            function (callback) {
                authorCreate('Isaac', 'Asimov', '1920-01-02', '1992-04-06', callback);
            },
            function (callback) {
                authorCreate('Bob', 'Billings', false, false, callback);
            },
            function (callback) {
                authorCreate('Jim', 'Jones', '1971-12-16', false, callback);
            },
            function (callback) {
                genreCreate("奇幻小说", callback);
            },
            function (callback) {
                genreCreate("科幻小说", callback);
            },
            function (callback) {
                genreCreate("法国诗歌", callback);
            },
        ],
        // optional callback
        cb);
}


function createBooks(cb) {
    async.parallel([
            function (callback) {
                bookCreate('风之名(《弑君者传奇》第1部)', '我从沉睡的古墓国王那里偷走了公主。我烧了特雷朋镇。我和费卢里安度过了一晚，然后带着我的理智和我的生活离开了。我被大学开除的时候比大多数人都要年轻。我踏着月光走过的路，别人白天不敢说。我曾与诸神交谈，爱过女人，写过使吟游诗人哭泣的歌曲。', '9781473211896', authors[0], [genres[0],], callback);
            },
            function (callback) {
                bookCreate("智者之惧(《弑君者传奇》第2部)", '再次拾起Kvothe弑君者的故事，我们跟随他流亡、政治阴谋、求爱、冒险、爱情和魔法……在这条道路上，他将那个时代最强大的魔术师、那个时代的传奇人物科沃特(Kvothe)变成了谦逊的酒吧老板科特(Kote)。', '9788401352836', authors[0], [genres[0],], callback);
            },
            function (callback) {
                bookCreate("寂静微升(《弑君者传奇》)", '在大学的深处，有一个黑暗的地方。很少有人知道它:一个由古老的通道和废弃的房间组成的破网。一个年轻的女人住在那里，在这个被遗忘的地方的中心，舒适地隐藏在Underthing蔓生的隧道中。', '9780756411336', authors[0], [genres[0],], callback);
            },
            function (callback) {
                bookCreate("猿和天使", "人类前往星球不是为了征服，也不是为了探索，甚至不是为了好奇。人类不惜一切代价奔赴各个星球去拯救他们发现的智慧生命。一股死亡的浪潮正在银河系中蔓延，一个不断膨胀的致命伽玛球…", '9780765379528', authors[1], [genres[1],], callback);
            },
            function (callback) {
                bookCreate("死波", "在本·波瓦的上一部小说《新地球》中，乔丹·凯尔领导了人类第一次超越太阳系的任务。他们发现了一个古代外星文明的遗迹。但一个外星人工智能存活了下来，它告诉乔丹·凯尔，银河系中心的黑洞爆炸产生了一波致命的辐射，从核心向地球扩散。除非人类采取行动拯救自己，否则地球上所有的生命都将被消灭……", '9780765379504', authors[1], [genres[1],], callback);
            },
            function (callback) {
                bookCreate('测试书1', '测试书概述1', 'ISBN111111', authors[4], [genres[0], genres[1]], callback);
            },
            function (callback) {
                bookCreate('测试书2', '测试书概述2', 'ISBN222222', authors[4], false, callback)
            }
        ],
        // optional callback
        cb);
}


function createBookInstances(cb) {
    async.parallel([
            function (callback) {
                bookInstanceCreate(books[0], 'London Gollancz, 2014.', false, 'Available', callback)
            },
            function (callback) {
                bookInstanceCreate(books[1], ' Gollancz, 2011.', false, 'Loaned', callback)
            },
            function (callback) {
                bookInstanceCreate(books[2], ' Gollancz, 2015.', false, false, callback)
            },
            function (callback) {
                bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
            },
            function (callback) {
                bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
            },
            function (callback) {
                bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
            },
            function (callback) {
                bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
            },
            function (callback) {
                bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
            },
            function (callback) {
                bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
            },
            function (callback) {
                bookInstanceCreate(books[0], 'Imprint XXX2', false, false, callback)
            },
            function (callback) {
                bookInstanceCreate(books[1], 'Imprint XXX3', false, false, callback)
            }
        ],
        // Optional callback
        cb);
}


async.series([
        createGenreAuthors,
        createBooks,
        createBookInstances
    ],
// Optional callback
    function (err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        } else {
            console.log('BOOKInstances: ' + bookinstances);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });