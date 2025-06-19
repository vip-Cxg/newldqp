"use strict";

let Table = require( './table.js' );

let TableMgr = module.exports;

TableMgr.m_tbl = {};
TableMgr.m_eye_tbl = {};
TableMgr.m_feng_tbl = {};
TableMgr.m_feng_eye_tbl = {};

TableMgr.Init = function()
{
    for ( let i =0; i < 9; i++ )
    {
        this.m_tbl[ i ] = new Table();
        this.m_tbl[ i ].init();
    }

    for ( let i =0; i < 9; i++ )
    {
        this.m_eye_tbl[ i ] = new Table();
        this.m_eye_tbl[ i ].init();
    }

    for ( let i =0; i < 9; i++ )
    {
        this.m_feng_tbl[ i ] = new Table();
        this.m_feng_tbl[ i ].init();
    }

    for ( let i =0; i < 9; i++ )
    {
        this.m_feng_eye_tbl[ i ] = new Table();
        this.m_feng_eye_tbl[ i ].init();
    }
};

TableMgr.getTable = function( gui_num, eye, chi )
{
    //cc.log('gui_num',gui_num);
    // cc.log('chi',chi);
    // cc.log('eye',eye);
    // cc.log('gui_num',gui_num);
    let tbl = null;
    if ( chi ) 
    {
        if ( eye ) 
        {
            tbl = this.m_eye_tbl[ gui_num ];
        }else{
             tbl = this.m_tbl[ gui_num ];
        }
    } 
    else 
    {
        if ( eye ) 
        {
            tbl = this.m_feng_eye_tbl[ gui_num ];
        }else{
            tbl = this.m_feng_tbl[ gui_num ];
        }
    }
    return tbl;
};

TableMgr.Add = function( key, gui_num, eye, chi) 
{
    let tbl = this.getTable( gui_num, eye, chi );
    if( tbl )
    {
        tbl.add( key );
    }
};

TableMgr.check = function( key, gui_num, eye, chi ) 
{   
    // cc.log('key',key);
    // cc.log('eye',eye);
    // cc.log('chi',chi);

    let tbl = this.getTable( gui_num, eye, chi );
    //cc.log(key);
    if( !tbl ) return false;

    //let i = 0;
    // cc.log('key',key, typeof(key));
    // cc.log(tbl.tbl[""+key]);
    //cc.log(tbl.tbl)
    // let count = 0;
    // for(let k in tbl.tbl){
    //     if(count == 3333)
    //         cc.log("+++++++++++++++++++++++++",k, typeof(k), JSON.stringify({"data":k}));
    //     if(k == "10100111")
    //         cc.log('hahahah',tbl.tbl[k]);
    //     count ++;
    // }
    // cc.log('count',count);
    //cc.log(JSON.stringify(this.m_tbl));
    //cc.log('value',this.m_tbl[1].tbl[2]);
    //cc.log('key',tbl.tbl[2]);
    //cc.log('tbl.check(2)',tbl.check( 2 ));
    //cc.log('tbl.check( key )',tbl.check( key ));
    return tbl.check( key );
};

TableMgr.LoadTable = function()
{
    for( let i = 0; i < 9; i ++ )
    {
        let name = "table_%d".replace( '%d', i );
        this.m_tbl[ i ].load( name );
    }

    for( let i = 0; i < 9; i ++ )
    {
        let name = "eye_table_%d".replace( '%d', i );
        this.m_eye_tbl[ i ].load( name );
    }
};

TableMgr.DumpTable = function() 
{
    for ( let i = 0; i < 9; i++ )
    {
        let name = "table_%d".replace( '%d', i );
        this.m_tbl[ i ].dump( name );
    }
    for ( let i = 0; i < 9; i++ )
    {
        let name = "eye_table_%d".replace( '%d', i );
        this.m_eye_tbl[ i ].dump( name );
    }
};

TableMgr.LoadFengTable=function()
{
    for(let i=0;i<9;i++){
        let name = "feng_table_%d".replace( '%d', i );
        this.m_feng_tbl[i].load(name);
    }
     for ( let i = 0; i < 9; i++ )
    {
        let name = "feng_eye_table_%d".replace( '%d', i );
        this.m_feng_eye_tbl[ i ].load( name );
    }
};

TableMgr.DumpFengTable = function() 
{
    for ( let i = 0; i < 9; i++ )
    {
        let name = "feng_table_%d.tbl".replace( '%d', i );
        this.m_feng_tbl[ i ].dump( name );
    }
    for ( let i = 0; i < 9; i++ )
    {
        let name = "feng_eye_table_%d.tbl".replace( '%d', i );
        this.m_feng_eye_tbl[ i ].dump( name );
    }
};