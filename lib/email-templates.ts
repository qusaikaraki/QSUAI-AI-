const escape = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function emailTemplate(template: string, p: Record<string, string>) {
  const titles: Record<string, string> = {
    received: "تم استلام تسجيلك بنجاح",
    approved: "تم قبول طلبك",
    waitlisted: "طلبك في قائمة الانتظار",
    reminder: "تذكير بجلستك القادمة",
    starting: "برنامجك يبدأ قريبًا",
    admin: "طلب تسجيل جديد",
  };
  const messages: Record<string, string> = {
    received:
      "تم استلام طلبك بنجاح. سنتواصل معك بخصوص الخطوات التالية. إرسال الطلب لا يؤكد المقعد.",
    approved: "يسعدنا قبول طلبك. راجع تعليمات الانضمام التالية.",
    waitlisted:
      "أُضيف طلبك إلى قائمة الانتظار. سنتواصل معك إذا توفر مقعد، ولا يعني ذلك ضمان القبول.",
    reminder: "نذكّرك بالجلسة القادمة. راجع موعدها وتعليمات الانضمام أدناه.",
    starting:
      "يقترب موعد بداية البرنامج. جهّز أدواتك وراجع تفاصيل الانضمام أدناه.",
    admin: "وصل طلب تسجيل جديد. افتح لوحة الإدارة لمراجعته.",
  };
  return {
    subject: titles[template] || titles.received,
    html: `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f3f6f6;font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#132c3b"><main style="max-width:580px;margin:32px auto;background:white;padding:36px;border-top:5px solid #16846c"><p>أكاديمية قصي للذكاء الاصطناعي</p><h1 style="font-size:26px">${escape(titles[template])}</h1><p>مرحبًا ${escape(p.name || "بك")}،</p><p>${escape(messages[template])}</p><h2 style="font-size:20px">${escape(p.course_name)}</h2><p>رقم التسجيل:</p><p dir="ltr">${escape(p.registration_id)}</p>${p.status === "waitlisted" ? "<p>حالة الطلب: قائمة الانتظار.</p>" : ""}<p style="white-space:pre-line">${escape(p.instructions)}</p><p>مع التحية،<br>قصي كركي</p></main></body></html>`,
  };
}
