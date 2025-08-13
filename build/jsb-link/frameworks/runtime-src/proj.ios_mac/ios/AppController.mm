/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

#import "AppController.h"
#import "cocos2d.h"
#import "AppDelegate.h"
#import "RootViewController.h"
#import "SDKWrapper.h"
#import "platform/ios/CCEAGLView-ios.h"
#import "DeviceUID.h"
#import <INTULocationManager/INTULocationManager.h>
#import "AFNetworking/AFHTTPSessionManager.h"
#import "TQLocationConverter.h"
#import <AppTrackingTransparency/AppTrackingTransparency.h>
#import <AdSupport/ASIdentifierManager.h>
#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"
#include "base/CCScheduler.h"
#import "BuglyAgent.h"

using namespace cocos2d;

@implementation AppController

Application* app = nullptr;
static std::string inviter;
static std::string uploadURL;
static std::string uploadToken;
static BOOL isUploadAvatar = true;
static RootViewController* vc;
static UIImagePickerController *imagePickerController;
@synthesize window;

#pragma mark -
#pragma mark Application lifecycle

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [[SDKWrapper getInstance] application:application didFinishLaunchingWithOptions:launchOptions];
    [BuglyAgent initSdk:@"b1a4918fa1"];
    // Add the view controller's view to the window and display.
    float scale = [[UIScreen mainScreen] scale];
    CGRect bounds = [[UIScreen mainScreen] bounds];
    window = [[UIWindow alloc] initWithFrame: bounds];
    
    // cocos2d application instance
    app = new AppDelegate(bounds.size.width * scale, bounds.size.height * scale);
    app->setMultitouch(true);
    
    // Use RootViewController to manage CCEAGLView
    _viewController = [[RootViewController alloc]init];
#ifdef NSFoundationVersionNumber_iOS_7_0
    _viewController.automaticallyAdjustsScrollViewInsets = NO;
    _viewController.extendedLayoutIncludesOpaqueBars = NO;
    _viewController.edgesForExtendedLayout = UIRectEdgeAll;
#else
    _viewController.wantsFullScreenLayout = YES;
#endif
    // Set RootViewController to window
    if ( [[UIDevice currentDevice].systemVersion floatValue] < 6.0)
    {
        // warning: addSubView doesn't work on iOS6
        [window addSubview: _viewController.view];
    }
    else
    {
        // use this method on ios6
        [window setRootViewController:_viewController];
    }
    
    [window makeKeyAndVisible];
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
    
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(statusBarOrientationChanged:)
        name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
    if([WXApi registerApp:@"wxcb45c285efd3f864"
            universalLink:@"https://aple.htptqs.com/wechat/"]){
//    if([WXApi registerApp:@"wx9dc167d3fa934a84"]){
        NSLog(@"WXApi 初始化成功");
    }else{
        NSLog(@"WXApi 初始化失败");
    }
    
    
    INTULocationManager *locMgr = [INTULocationManager sharedInstance];
    [locMgr requestLocationWithDesiredAccuracy:INTULocationAccuracyHouse
                                       timeout:10.0
                          delayUntilAuthorized:YES    // This parameter is optional, defaults to NO if omitted
                                         block:^(CLLocation *currentLocation, INTULocationAccuracy achievedAccuracy, INTULocationStatus status) {
         if (status != INTULocationStatusSuccess) {
             return;
         }
            
        CLLocationCoordinate2D location = currentLocation.coordinate;
        
        //判断是否在中国
        if (![TQLocationConverter isLocationOutOfChina:location])
        {
            //将WGS-84转为GCJ-02(火星坐标)
            location = [TQLocationConverter transformFromWGSToGCJ:location];
        }
        
         std::string jsCallStr = cocos2d::StringUtils::format("window.__require('native-extend').Social.getLocationCallback(%f,%f);", location.latitude,location.longitude);
         NSLog(@"jsCallStr = %s", jsCallStr.c_str());
         cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
              se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
              NSLog(@"getLocationCallback...");
         });
     }];
    
    [locMgr subscribeToLocationUpdatesWithDesiredAccuracy:INTULocationAccuracyHouse
                                                    block:^(CLLocation *currentLocation, INTULocationAccuracy achievedAccuracy, INTULocationStatus status) {
        if (status != INTULocationStatusSuccess) {
            return;
        }
        
        CLLocationCoordinate2D location = currentLocation.coordinate;
        
        //判断是否在中国
        if (![TQLocationConverter isLocationOutOfChina:location])
        {
            //将WGS-84转为GCJ-02(火星坐标)
            location = [TQLocationConverter transformFromWGSToGCJ:location];
        }
        std::string jsCallStr = cocos2d::StringUtils::format("window.__require('native-extend').Social.getLocationCallback(%f,%f);",
                                                             location.latitude,location.longitude);
        cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
                 se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
        });
        
    }];
    [UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera];
    imagePickerController = [[UIImagePickerController alloc] init];
    imagePickerController.delegate = self;
    imagePickerController.allowsEditing = YES;
    vc = _viewController;
    app->start();
    return YES;
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info
{
    [picker dismissViewControllerAnimated:YES completion:^{}];

    UIImage *image = [info objectForKey:UIImagePickerControllerEditedImage];
    /* 此处info 有六个值
     * UIImagePickerControllerMediaType; // an NSString UTTypeImage)
     * UIImagePickerControllerOriginalImage;  // a UIImage 原始图片
     * UIImagePickerControllerEditedImage;    // a UIImage 裁剪后图片
     * UIImagePickerControllerCropRect;       // an NSValue (CGRect)
     * UIImagePickerControllerMediaURL;       // an NSURL
     * UIImagePickerControllerReferenceURL    // an NSURL that references an asset in the AssetsLibrary framework
     * UIImagePickerControllerMediaMetadata    // an NSDictionary containing metadata from a captured photo
     */
    // 保存图片至本地，方法见下文
//    NSString* homeDirectory = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents"];
//    [self saveImage:image withName:@"currentImage.png"];

    CGSize size;
    NSString* scope;
    if(isUploadAvatar){
        scope = @"avatar";
        size = CGSizeMake(100,100);
    }else{
        scope = @"qrcode";
        size = CGSizeMake(400,400);
    }
    UIGraphicsBeginImageContext(size);
 
    // 绘制改变大小的图片
    [image drawInRect:CGRectMake(0, 0, size.width, size.height)];
 
    // 从当前context中创建一个改变大小后的图片
    UIImage* scaledImage = UIGraphicsGetImageFromCurrentImageContext();
 
    // 使当前的context出堆栈
    UIGraphicsEndImageContext();
 
    // 返回新的改变大小后的图片
//    scaledImage;
//    NSString *fullPath = [[NSHomeDirectory() stringByAppendingPathComponent:@"Documents"] stringByAppendingPathComponent:@"currentImage.png"];
//
//    UIImage *savedImage = [[UIImage alloc] initWithContentsOfFile:fullPath];

//    isFullScreen = NO;
//    [self.headerImage setImage:savedImage];
//
//    self.headerImage.tag = 100;
    NSData *imageData = UIImageJPEGRepresentation(scaledImage,1);
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    NSLog(@"imagePickerController %@ %@", [NSString stringWithCString:uploadURL.c_str() encoding:[NSString defaultCStringEncoding]], [NSString stringWithCString:uploadToken.c_str() encoding:[NSString defaultCStringEncoding]]);
//    NSLog(@"imagePickerController %@ %@", uploadURL, uploadToken);
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", nil];
    NSDictionary *headers = [NSDictionary dictionaryWithObject:[NSString stringWithFormat:@"Bearer %@", [NSString stringWithCString:uploadToken.c_str() encoding:[NSString defaultCStringEncoding]]] forKey:@"Authorization"];
    [manager POST:[NSString stringWithCString:uploadURL.c_str() encoding:[NSString defaultCStringEncoding]] parameters:nil headers:headers constructingBodyWithBlock:^(id<AFMultipartFormData>  _Nonnull formData) {
        [formData appendPartWithFileData:imageData name:@"file" fileName:@"avatar.jpg" mimeType:@"image/jpg"];
    }  progress:nil success:^(NSURLSessionDataTask * _Nonnull task, id  _Nonnull responseObject) {
        NSLog(@"%@",responseObject);
        NSDictionary *jsonDict = (NSDictionary *) responseObject;
        NSString *res = [NSString stringWithFormat:@"%@", [jsonDict objectForKey:@"image"]];
        
        std::string jsCallStr = cocos2d::StringUtils::format("window.__require('native-extend').Social.getPhotoCallback('%s', '%s');",res.UTF8String, scope.UTF8String);
        NSLog(@"jsCallStr = %s", jsCallStr.c_str());
        cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
                 se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
        });
    } failure:^(NSURLSessionDataTask * _Nonnull task, NSError * _Nonnull error) {
        NSLog(@"%@",error);
        
        std::string jsCallStr = "window.__require('native-extend').Social.getPhotoCallback('');";
        NSLog(@"jsCallStr = %s", jsCallStr.c_str());
        cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
                 se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
        });
    }];

}


//用户点击图像选取器中的“cancel”按钮时被调用，这说明用户想要中止选取图像的操作
- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    
    std::string jsCallStr = "window.__require('native-extend').Social.getPhotoCallback('');";
    cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
             se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
             NSLog(@"imagePickerControllerDidCancel...");
    });
    
    [vc dismissViewControllerAnimated:YES completion:^{}];
}

+ (NSString *)getUUID{
    return [DeviceUID uid];
}
+ (NSString *)getIDFA{
    return [[ASIdentifierManager sharedManager].advertisingIdentifier UUIDString];
}
+(void) setCopy: (NSString *)text{
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = text;
}

+ (void)selectPicture: (NSString *)url token:(NSString *)token {
    isUploadAvatar = true;
    uploadURL = cocos2d::StringUtils::format("%s",url.UTF8String);
    uploadToken = cocos2d::StringUtils::format("%s",token.UTF8String);
//    NSLog(@"selectPicture %@ %@", uploadURL, uploadToken);
    [vc presentViewController:imagePickerController animated:YES completion:^{}];
}
+ (void)selectQRCode: (NSString *)url token:(NSString *)token {
    isUploadAvatar = false;
    uploadURL = cocos2d::StringUtils::format("%s",url.UTF8String);
    uploadToken = cocos2d::StringUtils::format("%s",token.UTF8String);
//    NSLog(@"selectPicture %@ %@", uploadURL, uploadToken);
    [vc presentViewController:imagePickerController animated:YES completion:^{}];
}

+(void) makeCall: (NSString *)phone{
    NSMutableString* str=[[ NSMutableString alloc ]  initWithFormat : @"telprompt://%@" , phone ];
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:str]];
}
+(void) openUrl: (NSString *)url{
    NSURL *cleanURL = [NSURL URLWithString:[NSString stringWithFormat:@"%@",url]];
    [[UIApplication sharedApplication] openURL:cleanURL];
}
+(NSString *)getInviter{
    return [NSString stringWithCString:inviter.c_str() encoding:[NSString defaultCStringEncoding]];
}

- (void)statusBarOrientationChanged:(NSNotification *)notification {
    CGRect bounds = [UIScreen mainScreen].bounds;
    float scale = [[UIScreen mainScreen] scale];
    float width = bounds.size.width * scale;
    float height = bounds.size.height * scale;
    Application::getInstance()->updateViewSize(width, height);
}

- (void)applicationWillResignActive:(UIApplication *)application {
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
    app->onPause();
    [[SDKWrapper getInstance] applicationWillResignActive:application];
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
    app->onResume();
    [[SDKWrapper getInstance] applicationDidBecomeActive:application];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
     If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     */
    [[SDKWrapper getInstance] applicationDidEnterBackground:application]; 
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    /*
     Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
     */
    [[SDKWrapper getInstance] applicationWillEnterForeground:application]; 
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    [[SDKWrapper getInstance] applicationWillTerminate:application];
    delete app;
    app = nil;
}


#pragma mark -
#pragma mark Memory management

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    /*
     Free up as much memory as possible by purging cached data objects that can be recreated (or reloaded from disk) later.
     */
}
#pragma mark -
#pragma mark Wechat
- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url {
    return  [WXApi handleOpenURL:url delegate:self];
}

+ (void)sendWXAuthReq{
    if([WXApi isWXAppInstalled]){//判断用户是否已安装微信App
        SendAuthReq *req = [[SendAuthReq alloc] init];
        
        req.state = @"wx_oauth_authorization_state";//用于保持请求和回调的状态，授权请求或原样带回
        req.scope = @"snsapi_userinfo";//授权作用域：获取用户个人信息
        [WXApi sendReq:req completion:nil];
        
//        [WXApi sendReq:req];//发起微信授权请求
    }else{
        std::string jsCallStr = "window.__require('native-extend').Social.wechatCallback('');";
        cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
                 se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
                 NSLog(@"sendWXAuthReq...");
        });
    }
}
-(void) onResp:(BaseResp*)resp{
    if([resp isKindOfClass:[SendAuthResp class]])
    {
        SendAuthResp *saresp = (SendAuthResp *)resp;
        NSString* code = @"";
        NSLog(@"code:%@ state:%@",saresp.code, saresp.state);
        if([saresp.state isEqualToString:@"wx_oauth_authorization_state"]){//微信授权成功
            code = saresp.code; //获得code
        }
        std::string jsCallStr = cocos2d::StringUtils::format("window.__require('native-extend').Social.wechatCallback('%s');",code.UTF8String);
        cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
                 se::ScriptEngine::getInstance()->evalString(jsCallStr.c_str());
                 NSLog(@"onResp...");
        });
        
    }
}
-(void)callJsEngineCallBack:(NSString*) funcNameStr :(NSString*) contentStr
{
    NSLog(@"callJsEngineCallBack...");
    
    std::string funcName = [funcNameStr UTF8String];
    std::string param = [contentStr UTF8String];
    std::string jsCallStr = cocos2d::StringUtils::format("%s(\"%s\");",funcName.c_str(), param.c_str());
    NSLog(@"jsCallStr = %s", jsCallStr.c_str());
//    ScriptingCore::getInstance()->evalString(jsCallStr.c_str());
}

+ (int)saveTextureToLocal: (NSString *)imgPath {
    UIImage *image = [UIImage imageWithContentsOfFile:imgPath]; // 取得图片
    UIImageWriteToSavedPhotosAlbum(image, NULL, NULL, NULL);
    cocos2d::Application::getInstance()->getScheduler()->performFunctionInCocosThread([=]() {
             se::ScriptEngine::getInstance()->evalString("window.__require('native-extend').Social.saveImageCallback(true);");
             NSLog(@"saveImageCallback...true");
    });
    return 1;
}
@end
