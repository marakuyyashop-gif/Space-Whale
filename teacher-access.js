(() => {
  const params=new URLSearchParams(location.search);
  const guestPage=location.pathname.endsWith('/classroom.html')&&(params.has('guest')||params.has('session'));
  window.SpaceWhaleTeacherAccess=(async()=>{
    try {
      const client=window.spaceWhaleSupabase;
      if(!client)throw new Error('Сервис входа недоступен. Обновите страницу.');
      const {data,error}=await client.auth.getUser();
      if(guestPage&&(!data?.user||error)){document.documentElement.removeAttribute('data-teacher-check');return true;}
      if(error||!data.user){location.replace('login.html?next='+encodeURIComponent(location.pathname.split('/').pop()+location.search));return false;}
      const result=await client.rpc('is_teacher_user');
      if(result.error)throw result.error;
      window.SpaceWhaleIsTeacher=result.data===true;
      if(guestPage){document.documentElement.removeAttribute('data-teacher-check');return true;}
      if(result.data!==true)throw new Error('Учительский кабинет закрыт. Для занятия используйте ссылку преподавателя.');
      document.documentElement.removeAttribute('data-teacher-check');return true;
    } catch(error){
      document.body.replaceChildren();const main=document.createElement('main');main.style.cssText='max-width:440px;margin:15vh auto;padding:24px;font:16px/1.6 sans-serif';
      const message=document.createElement('p');message.textContent=error.message||'Нет доступа к кабинету.';
      const back=document.createElement('a');back.href='index.html';back.textContent='На главную';main.append(message,back);document.body.append(main);
      document.documentElement.removeAttribute('data-teacher-check');return false;
    }
  })();
})();
