function parseDate(v){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v||'')))return null;
  const [y,m,d]=String(v).split('-').map(Number),x=new Date(Date.UTC(y,m-1,d));
  if(x.getUTCFullYear()!==y||x.getUTCMonth()!==m-1||x.getUTCDate()!==d)return null;
  return x;
}
module.exports=function reservationCalendarQuery(params){
  const p=params||{},from=p.from,to=p.to;
  if(from==null&&to==null)return {text:'SELECT * FROM reservations ORDER BY reservation_date DESC,reservation_time DESC,id DESC LIMIT 500',values:[]};
  const a=parseDate(from),b=parseDate(to);
  if(!a||!b)return {error:'Valid from and to dates are required.'};
  if(a>b)return {error:'The calendar date range is reversed.'};
  const days=Math.round((b-a)/86400000);
  if(days>93)return {error:'Calendar range is too large.'};
  return {text:'SELECT * FROM reservations WHERE reservation_date BETWEEN $1::date AND $2::date ORDER BY reservation_date DESC,reservation_time DESC,id DESC',values:[String(from),String(to)]};
};
