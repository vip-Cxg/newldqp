
/**GoEasy配置 */
export class GoEasyConfig {
    /**聊天类型 */
    static ChatType={
        /**私聊 */
        PRIVATE:"private",
        /**群聊 */
        GROUP:"group",
    }

    /**聊天内容类型 */
    static ContentType = {
        /**文字类型 */
        TEXT: "text",
        /**图片类型 */
        IMAGE: "img",
    }

    /**推送消息种类 */
    static MessageType = {
        /**邮件 */
        EMAIL: "EMAIL",
        /**金币更新 */
        RECHARGE: "RECHARGE",
        /**交易更新 */
        TRADE: "TRADE",
        /**交易私聊 */
        PRIVATE: "PRIVATE",
        /**客服 */
        SERVICE: "SERVICE"
    }

    /**订阅群字段 */
    static Group=["EMAIL"]

    /**客服ID */
    static ServiceID="service001"
    /**服务器ID */
    static ServerID="1000"
    
}