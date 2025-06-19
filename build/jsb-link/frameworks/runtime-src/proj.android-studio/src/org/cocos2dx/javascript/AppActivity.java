package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.cocos2dx.okhttp3.MediaType;
import org.cocos2dx.okhttp3.MultipartBody;
import org.cocos2dx.okhttp3.OkHttpClient;
import org.cocos2dx.okhttp3.Request;
import org.cocos2dx.okhttp3.RequestBody;
import org.cocos2dx.okhttp3.Response;
import org.json.JSONException;
import org.json.JSONObject;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Bundle;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
//import cn.net.shoot.sharetracesdk.AppData;
//import cn.net.shoot.sharetracesdk.ShareTrace;
//import cn.net.shoot.sharetracesdk.ShareTraceInstallListener;
//import cn.net.shoot.sharetracesdk.ShareTraceWakeUpListener;


import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationListener;
//import com.tencent.bugly.crashreport.CrashReport;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
// import com.wildma.pictureselector.PermissionUtils;
//import com.wildma.pictureselector.PictureBean;
//import com.wildma.pictureselector.PictureSelector;


import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;

public class AppActivity extends Cocos2dxActivity implements AMapLocationListener {
    @SuppressLint("StaticFieldLeak")
    private static Cocos2dxActivity sCocos2dxActivity;

    public static String inviter = "";
    @SuppressLint("StaticFieldLeak")
    public static ImageView sSplashBgImageView = null;

    public static boolean isUploadAvatar = true;
    public AMapLocationClient mlocationClient;

    private static final int PERMISSION_CODE_LOCATION = 0x15;
    private static final int PERMISSION_CODE_SAVEIMAGE = 0x16;

    //新增代码 wxcb45c285efd3f864
    public static String wx_appid = "wxcb45c285efd3f864";
    public static IWXAPI wx_api;
    private static final String TAG = "XYQP";
    private static final String TAG_LOCATION = "GAME_LOCATION";

    private static void showSplash() {
        sSplashBgImageView = new ImageView(sCocos2dxActivity);
        int id = getContext().getResources().getIdentifier("splash", "drawable", "org.cocos2d.demo");
        sSplashBgImageView.setImageResource(id);
        sSplashBgImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        sCocos2dxActivity.addContentView(sSplashBgImageView,
                new WindowManager.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                )
        );
    }

    @Override
    public void onLocationChanged(AMapLocation amapLocation) {
        if (amapLocation != null) {
            if (amapLocation.getErrorCode() == 0) {
                //定位成功回调信息，设置相关消息
                amapLocation.getLocationType();//获取当前定位结果来源，如网络定位结果，详见定位类型表
                amapLocation.getLatitude();//获取纬度
                amapLocation.getLongitude();//获取经度
                amapLocation.getAccuracy();//获取精度信息

//                Toast.makeText(this, "读取位置成功", Toast.LENGTH_SHORT).show();
//                Log.d(TAG_LOCATION, String.format("onLocationChanged (%f, %f)",amapLocation.getLatitude(),amapLocation.getLongitude()));
                String CALLBACK_PATTERN = "window.__require('native-extend').Social.getLocationCallback(%s,%s);";
                final String evalStr = String.format(CALLBACK_PATTERN, amapLocation.getLatitude(), amapLocation.getLongitude());
                sCocos2dxActivity.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString(evalStr);
                    }
                });
            } else {
                //显示错误信息ErrCode是错误码，errInfo是错误信息，详见错误码表。
//                Toast.makeText(this, "location Error, ErrCode:"
//                        + amapLocation.getErrorCode() + ", errInfo:"
//                        + amapLocation.getErrorInfo(), Toast.LENGTH_LONG).show();
                Log.e(TAG_LOCATION, "location Error, ErrCode:"
                        + amapLocation.getErrorCode() + ", errInfo:"
                        + amapLocation.getErrorInfo());
            }
        }
    }

    /**
     * 这是给 CC JS 调用的隐藏原生开屏背景的方法
     */
    public static void hideSplash() {
        sCocos2dxActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (sSplashBgImageView != null) {
                    sSplashBgImageView.setVisibility(View.GONE);
                }
            }
        });
    }

    public static void sendWXAuthReq() {
        Log.e(TAG, "AppActivity wechat_login");
        SendAuth.Req req = new SendAuth.Req();
        req.scope = "snsapi_userinfo";
        req.state = "wx_oauth_authorization_state";
        //    System.out.println("reqxxxxxxxxx  is " + req);
        //利用微信api发送请求
        wx_api.sendReq(req);

    }

    //新增代码(回调函数)
    public static void callJsFunction(final String value) {
        Log.i(TAG, "appData=aaaaaaaa");

        sCocos2dxActivity.runOnGLThread(new Runnable() {
            @Override
            public void run() {
            Log.i(TAG, "appData=aaaaaaaaaaaa"+value);
                String CALLBACK_PATTERN = "window.__require('native-extend').Social.wechatCallback('%s');";
                String evalStr = String.format(CALLBACK_PATTERN, value);
                Cocos2dxJavascriptJavaBridge.evalString(evalStr);
            }
        });

    }


//    private final ShareTraceWakeUpListener wakeUpListener = new ShareTraceWakeUpListener() {
//        @Override
//        public void onWakeUp(AppData data) {
//            Log.i(TAG, "appData=" + data.toString());
//            Log.e("sharetrace", "appData=" + (data == null ? null : data.toString()));
//            inviter = data.getParamsData();
//        }
//    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initSDK(this, "cd89d34935");
//        ShareTrace.init(this.getApplication());
        // Workaround in
        // https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            // Android launched another instance of the root activity into an existing task
            // so just quietly finish and go away, dropping the user back into the activity
            // at the top of the stack (ie: the last state of this task)
            // Don't need to finish it again since it's finished in super.onCreate .
            return;
        }
        //screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // 第一步：在第二阶段加入我们的背景View
        sCocos2dxActivity = this;

        wx_api = WXAPIFactory.createWXAPI(this, wx_appid, true);
        wx_api.registerApp(wx_appid);
        showSplash();
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.getInstance().init(this);
//
//        ShareTrace.getWakeUpTrace(getIntent(), wakeUpListener);
//        ShareTrace.getInstallTrace(new ShareTraceInstallListener() {
//            @Override
//            public void onInstall(AppData data) {
//                Log.i(TAG, "appData=" + data.toString());
//                inviter = data.getParamsData();
//            }
//
//            @Override
//            public void onError(int code, String msg) {
//                Log.e(TAG, "Get install trace info error. code=" + code + ",msg=" + msg);
//            }
//        });
// 请求定位权限
        String[] locationPermissions = {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
        };
        checkAndRequestPermissions(locationPermissions, PERMISSION_CODE_LOCATION);

    //     // 权限请求码
    //    boolean checkPermissionFirst = PermissionUtils.checkPermissionFirst(this, PERMISSION_CODE_LOCATION,  new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION});

    //    Log.e(TAG_LOCATION, "checkPermissionFirst " + checkPermissionFirst);

        mlocationClient = new AMapLocationClient(this);
        //初始化定位参数
        mLocationOption = new AMapLocationClientOption();
        //设置定位监听
        mlocationClient.setLocationListener(this);

        //设置定位模式为高精度模式，Battery_Saving为低功耗模式，Device_Sensors是仅设备模式
        mLocationOption.setLocationMode(AMapLocationClientOption.AMapLocationMode.Hight_Accuracy);
        //设置定位间隔,单位毫秒,默认为2000ms
        mLocationOption.setInterval(2000);
        //设置定位参数
        mlocationClient.setLocationOption(mLocationOption);
        // 此方法为每隔固定时间会发起一次定位请求，为了减少电量消耗或网络流量消耗，
        // 注意设置合适的定位时间的间隔（最小间隔支持为1000ms），并且在合适时间调用stopLocation()方法来取消定位请求
        // 在定位结束后，在合适的生命周期调用onDestroy()方法
        // 在单次定位情况下，定位无论成功与否，都无需调用stopLocation()方法移除请求，定位sdk内部会移除
        // 启动定位
    //    if (checkPermissionFirst) {
    //        this.startLocation();
    //    }


    }

    public AMapLocationClientOption mLocationOption = null;

    private void startLocation() {
        mlocationClient.startLocation();
        Log.e(TAG_LOCATION, "startLocation");
    }
    private void checkAndRequestPermissions(String[] permissions, int requestCode) {
        boolean allGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (allGranted) {
            // 已有权限
            if (requestCode == PERMISSION_CODE_LOCATION) {
//                this.startLocation();
            }
//            else if (requestCode == PERMISSION_CODE_SAVEIMAGE) {
//                saveTextureToLocal(imgPath); // 传递实际图片路径
//            }
        } else {
            // 请求权限
            ActivityCompat.requestPermissions(this, permissions, requestCode);
        }
    }

    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);
        SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView, this);

        return glSurfaceView;
    }

    public static String getInviter() {
        Log.d(TAG, "getInviter: " + inviter);
        return inviter;
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.getInstance().onResume();

    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.getInstance().onPause();

    }


    @Override
    protected void onDestroy() {
        super.onDestroy();

        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }

        SDKWrapper.getInstance().onDestroy();

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.getInstance().onActivityResult(requestCode, resultCode, data);
//        if (requestCode == PictureSelector.SELECT_REQUEST_CODE) {
//            String path = "";
//            if (data != null) {
//                PictureBean pictureBean = data.getParcelableExtra(PictureSelector.PICTURE_RESULT);
//                if (pictureBean.isCut()) {
//                    path = pictureBean.getPath();
//                } else {
//                    path = pictureBean.getUri().getPath();
//                }
//            }
//
//            final String filePath = path;
//            final String scope = isUploadAvatar?"avatar":"qrcode";
//            sCocos2dxActivity.runOnGLThread(new Runnable() {
//                @Override
//                public void run() {
//                    String CALLBACK_PATTERN = "window.__require('native-extend').Social.getPhotoCallback('%s','%s');";
//                    String evalStr = String.format(CALLBACK_PATTERN, filePath, scope);
//                    Cocos2dxJavascriptJavaBridge.evalString(evalStr);
//                }
//            });
//        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.getInstance().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.getInstance().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.getInstance().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.getInstance().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.getInstance().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.getInstance().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.getInstance().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.getInstance().onStart();
        super.onStart();
    }

    @SuppressLint("HardwareIds")
    public static String getUUID() {
        return Settings.Secure.getString(getContext().getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    public static void selectPicture() {
        isUploadAvatar = true;
//        PictureSelector
//                .create(sCocos2dxActivity, PictureSelector.SELECT_REQUEST_CODE)
//                .selectPicture(true, 100, 100, 1, 1);
    }

    public static void selectQRCode() {
        isUploadAvatar = false;
//        PictureSelector
//                .create(sCocos2dxActivity, PictureSelector.SELECT_REQUEST_CODE)
//                .selectPicture(true, 400, 400, 1, 1);
    }


    private static ClipboardManager getClipboardService() {
        return (ClipboardManager) getContext().getSystemService(CLIPBOARD_SERVICE);
    }

    public static void setCopy(String text) {
        ClipData clipdata = ClipData.newPlainText(null, text);
        ClipboardManager clipboard = getClipboardService();
        clipboard.setPrimaryClip(clipdata);
    }

    /**
     * 拨打电话（跳转到拨号界面，用户手动点击拨打）
     *
     * @param phoneNum 电话号码
     */
    public static void makeCall(String phoneNum) {
        Intent intent = new Intent(Intent.ACTION_DIAL);
        Uri data = Uri.parse("tel:" + phoneNum);
        intent.setData(data);
        sCocos2dxActivity.startActivity(intent);
    }

    /**调用浏览器打开网页*/
    public static void openUrl(String url) {
        Uri uri = Uri.parse(url);
        Intent intent = new Intent(Intent.ACTION_VIEW,uri);
        sCocos2dxActivity.startActivity(intent);
    }

    public static String getCopy() {
        String empStr = "";
        try {

            ClipboardManager clipboard = getClipboardService();
            ClipData clipData = clipboard.getPrimaryClip();
            if (clipData != null && clipData.getItemCount() >= 1) {
                ClipData.Item firstItem = clipboard.getPrimaryClip().getItemAt(0);
                empStr = "" + firstItem.getText();
            }
        } catch (Exception e) {
            Log.d(TAG, "getCopy: " + e.getMessage());
        }
        return empStr;
    }

    public static String uploadImage(String url, String token, String imagePath) throws IOException, JSONException {
        try {
            OkHttpClient okHttpClient = new OkHttpClient();
            Log.d(TAG, "imagePath " + imagePath);
            File file = new File(imagePath);
            if (!file.exists()) {
                return "";
            }
            RequestBody image = RequestBody.create(MediaType.parse("image/png"), file);
            RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("file", imagePath, image)
                    .build();
            Request request = new Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer " + token)
                    .post(requestBody)
                    .build();
            Response response = okHttpClient.newCall(request).execute();
            JSONObject jsonObject = new JSONObject(response.body().string());
            return jsonObject.optString("image");
        } catch (Exception ex) {
            return "";
        }
    }

    private boolean isToast = true;//是否弹吐司，为了保证for循环只弹一次

     @Override
     public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
         super.onRequestPermissionsResult(requestCode, permissions, grantResults);
         boolean isPermissions = true;
         for (int i = 0; i < permissions.length; i++) {
             if (grantResults[i] == PackageManager.PERMISSION_DENIED) {
                 isPermissions = false;
                 if (!ActivityCompat.shouldShowRequestPermissionRationale(this, permissions[i])) { //用户选择了"不再询问"
                     if (isToast) {
                         Toast.makeText(this, "请手动打开该应用需要的权限", Toast.LENGTH_SHORT).show();
                         isToast = false;
                     }
                 }
             }
         }
         isToast = true;
         if (isPermissions && requestCode == PERMISSION_CODE_LOCATION) {
             Log.d("onRequestPermission", "onRequestPermissionsResult: " + "允许所有权限");
             this.startLocation();
         } else {
             Log.d("onRequestPermission", "onRequestPermissionsResult: " + "有权限不允许");
         }
     }
    public static int saveTextureToLocal( String imgPath) {
    //    Log.d("图片地址", imgPath);
    //    //先调用上边的方法 获取一下权限  有的时候会说你没有权限

    //    boolean checkPermissionFirst = PermissionUtils.checkPermissionFirst(sCocos2dxActivity, PERMISSION_CODE_SAVEIMAGE,
    //            new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE});

    //    if (!checkPermissionFirst) {
    //        // Toast.makeText(sCocos2dxActivity, "没有权限", Toast.LENGTH_SHORT).show();
    //        return 0;
    //    }
    //    //从路径中读取 照片
    //    Bitmap bmp = BitmapFactory.decodeFile(imgPath);
    //    if (AppActivity.saveImageToGallery(sCocos2dxActivity, bmp)) {
    //        sCocos2dxActivity.runOnGLThread(new Runnable() {
    //            @Override
    //            public void run() {
    //                Cocos2dxJavascriptJavaBridge.evalString("window.__require('native-extend').Social.saveImageCallback(true);");
    //            }
    //        });
    //    } else {
    //        sCocos2dxActivity.runOnGLThread(new Runnable() {
    //            @Override
    //            public void run() {
    //                Cocos2dxJavascriptJavaBridge.evalString("window.__require('native-extend').Social.saveImageCallback(false);");
    //            }
    //        });
    //    }
        return 1;
    }

    public static boolean saveImageToGallery(Context context, Bitmap bmp) {
        // 首先保存图片
        String storePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "dearxy";
        File appDir = new File(storePath);
        if (!appDir.exists()) {
            appDir.mkdir();
        }
        String fileName = System.currentTimeMillis() + ".jpg";
        File file = new File(appDir, fileName);
        try {
            FileOutputStream fos = new FileOutputStream(file);
            //通过io流的方式来压缩保存图片
            boolean isSuccess = bmp.compress(Bitmap.CompressFormat.JPEG, 60, fos);
            fos.flush();
            fos.close();

            //把文件插入到系统图库
            //MediaStore.Images.Media.insertImage(context.getContentResolver(), file.getAbsolutePath(), fileName, null);

            //保存图片后发送广播通知更新数据库
            Uri uri = Uri.fromFile(file);
            context.sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri));
            MediaScannerConnection.scanFile(sCocos2dxActivity,
                    new String[]{file.getAbsolutePath()},
                    new String[]{"image/jpeg"},
                    new MediaScannerConnection.OnScanCompletedListener() {

                        public void onScanCompleted(String path, Uri uri) {
                            Log.i("TAG", "Finished scanning " + path);
                        }
                    });
            return isSuccess;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    public static void initSDK(Context context, String appId) {
//        CrashReport.initCrashReport(context.getApplicationContext(), appId, false);
    }

    public static void postException(int category, String name, String reason, String stack){
        postException(category, name, reason, stack, null);
    }

    public static void postException(int category, String name, String reason, String stack, Map<String, String> extraInfo){
//        CrashReport.postException(category, name, reason, stack, extraInfo);
    }
}
