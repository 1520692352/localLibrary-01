const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

//定义作者的模式并且导出为模型
const AuthorSchema = new Schema(
    {
        first_name : {type:String,required:true,max:100},//名
        family_name : {type:String , required:true , max:100},//姓
        date_of_birth : {type:Date},//出生日
        date_of_death : {type:Date},//死亡日
    }
);

// 虚拟属性'name'：表示作者全名
AuthorSchema
    .virtual('name')
    .get(function () {
        return this.family_name + ',' + this.first_name;
    });

// 虚拟属性'lifespan'：表示作者寿命
AuthorSchema
    .virtual('lifespan')
    .get(function () {
        return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    });

// 虚拟属性'url'：表示作者URL
AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

// 虚拟属性'出生日期'
AuthorSchema
    .virtual('birth')
    .get(function () {
        return this.date_of_birth?moment(this.date_of_birth).format('YYYY-MM-DD') : ""
    });

// 虚拟属性'死亡日期'
AuthorSchema
    .virtual('death')
    .get(function () {
        return this.date_of_death?moment(this.date_of_death).format('YYYY-MM-DD') : ""
    });

//导出Author模型
module.exports = mongoose.model('Author',AuthorSchema);