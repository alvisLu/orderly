import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.locale("zh-tw");

export default dayjs;
