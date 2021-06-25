const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//定义藏书的模式并且导出为模型
const BookSchema = new Schema({
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},//作者，引用了Author模型，并且设置了是必需的。
    summary: {type: String, required: true},//简介
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]//种类，引用了Genre模型
});

// 虚拟属性'url'：藏书 URL
BookSchema
    .virtual('url')
    .get(function () {
        return '/catalog/book/' + this._id;
    });

// 导出 Book 模块
module.exports = mongoose.model('Book', BookSchema);