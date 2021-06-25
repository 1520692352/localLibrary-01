const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

////定义藏书副本的模式并且导出为模型，
// 表示可供借阅的藏书的特定副本，其中包含该副本是否可用、还书期限，“出版批次”或版本详细信息。
const BookInstanceSchema = new Schema({
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },// 指向相关藏书的引用，并且是必须的
        imprint: {type: String, required: true},// 出版项
        status: {
            type: String,
            required: true,
            enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
            default: 'Maintenance'
        },//书籍状态，可用，维护，借出，预定，默认维护
        due_back: {type: Date, default: Date.now}//还书期限，默认今天
    }
);

// 虚拟属性'url'：藏书副本 URL
BookInstanceSchema
    .virtual('url')
    .get(function () {
        return '/catalog/bookinstance/' + this._id;
    });

//虚拟属性'due_back_formatted'
BookInstanceSchema
    .virtual('due_back_formatted')
    .get(function () {
        return moment(this.due_back).format('YYYY-MM-DD');
    })

// 导出 BookInstancec 模型
module.exports = mongoose.model('BookInstance', BookInstanceSchema);