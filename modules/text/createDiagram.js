module.exports={twoColumns(o,t,e){let n=0;for(const t of o)t[0].length>n&&(n=t[0].length);const l=n+t,s=[];for(const t of o){const o=l-t[0].length;let n="";for(let t=0;t<o;t++)n=`${n}${e}`;s.push(`${t[0]}${n}${t[1]}`)}return s}};
