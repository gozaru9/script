var Core = require('./core');

/** テーブル名 */
var tableName = 'M_CUSTOMER';

var custmoer = function custmoer()
{
    Core.call(this, tableName);
};

//coreModelを継承する
var util = require('util');
util.inherits(custmoer, Core);

var model = new custmoer();

/**
 * 顧客の情報を取得する
 * 
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.getById = function(req, res)
{
    model.getById(req.params.id, function(err, data)
    {
        if (err)
        {
            console.log(err);
            //レスポンスコード確認
            res.json({data: data});
        }
        else
        {
            res.json({data: data});
        }
    });
};


/**
 * 顧客の一覧を取得する
 * 
 * @param {Object} req 画面からのリクエスト
 * @param {Object} res 画面へのレスポンス
 */
exports.getAll = function(req, res)
{
    model.getAll(function(err, data)
    {
        if (err)
        {
            console.log(err);
            //レスポンスコード確認
            res.json({data: data});
        }
        else
        {
            res.json({data: data});
        }
    });
};

/**
 * 
 */
exports.getDetail = function(req, res)
{
    var id = req.params.id;
    if (void 0 === id)
    {
        //
    }
    model.getById(id, function(err, data)
    {
        if (err.length > 0 || null === data)
        {
            console.log(err);
            //レスポンスコード確認
            res.json({data: data});
        }
        
        //非同期でアプローチ方法と売り上げ推移を取得する
        model.async.parallel(
        [
            function(callback)
            {
                if (null === data[0].rank_id)
                {
                    console.log('rank id is null');
                    callback();
                }
                else
                {
                    var table = 'M_APPROACH T1 INNER JOIN M_RANK T2 ON T1.rank_id = T2.Id ';
                        table += 'INNER JOIN M_MESSAGE T3 on T1.message_id = T3.Id ';
                        table += 'INNER JOIN M_CATEGORY T4 on T3.category_id = T4.Id';
                        
                    var col = 'T1.Id, T2.name, T3.title, T3.situation, T3.contents, T4.name AS category_name';
                    var where = 'T1.rank_id = @rank_id';
                    
                    var qObj = model.getQueryObject(col, table, where);
                    qObj.request.input('rank_id', model.db.Int, data[0].rank_id);
                    
                    model.select(qObj, qObj.request, callback);
                }
            },
            function(callback)
            {
                //月刊サマリを取得
                callback();
            }
        ],function(err, items)
        {
            if (err.length > 0)
            {
                console.log(err);
            }
            res.json({customer: data[0], approch: items[0], orders: []});
        });
        
    });
};

/**
 * 
 */
exports.orders = function(req, res)
{
    var id = req.params.id;
    if (void 0 === id)
    {
        //
    }
    
    var col = "Id, FORMAT(date, 'yyyy/MM/dd') as date, price";
    var table =  'T_READ_ORDERS';
    var where = 'customer_id = @customer_id order by date';
    
    var qObj = model.getQueryObject(col, table, where);
    qObj.request.input('customer_id', model.db.Int, id);
    
    model.select(qObj, qObj.request, function(err, data)
    {
        if (err)
        {
            //
        }
        res.json({orders: data});
    });
};
