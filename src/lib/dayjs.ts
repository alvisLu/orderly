import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("zh-tw");

export const STORE_TIME_ZONE = "Asia/Taipei";

export default dayjs;
