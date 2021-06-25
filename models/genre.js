const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//定义图书类型模式并导出为模型
const GenreSchema = new Schema({
    name:{
        type:String,
        required:true,
        min:3,
        max:100,
    }
});

//增加虚拟属性url,返回图书类型URL
GenreSchema
    .virtual('url')
    .get(function () {
        return '/catalog/genre/' + this._id;
    });

module.exports = mongoose.model('Genre',GenreSchema);