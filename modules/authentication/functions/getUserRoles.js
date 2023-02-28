module.exports=(s,e)=>{const o=[];if(o.push("roles:empty"),o.push("roles:default"),s&&o.push("roles:authenticated"),e?.roles)for(const s of e.roles)o.push(`customRoles:${s}`);return o};
