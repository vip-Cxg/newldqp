package com.ldplay.game.wxapi;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;

import org.cocos2dx.javascript.AppActivity;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler
{
//    public static int ReqState = -1;// 0为登录， 1为分享
    private static final String TAG = "XYQP";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 这句话很关键
        try {
            AppActivity.wx_api.handleIntent(getIntent(), this);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onReq(BaseReq baseReq) {
        Log.e(TAG, "AppActivity wechat1_login_test");
        System.out.println("Enter the onResp");
    }

    // 向微信发送的请求的响应信息回调该方法
    // @Override
    public void onResp(BaseResp baseResp)
    {
        String code = "";
        Log.e(TAG, "AppActivity wechat_login_test");

        if(baseResp.errCode == BaseResp.ErrCode.ERR_OK){
            code = ((SendAuth.Resp) baseResp).code;
        }   
        Log.e(TAG, "AppActivity wechat_login_test"+baseResp.errCode);
        AppActivity.callJsFunction(code);
        finish();
    }
}