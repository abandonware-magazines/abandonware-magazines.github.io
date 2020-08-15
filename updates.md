---
layout: basic_page
title:  עדכונים
---

<p class="lead">
בדף זה תוכלו לצפות בהיסטוריית העדכונים של האתר.
</p>
<p>
ניתן להרשם לעדכונים באמצעות <a href="/feed.xml">פיד RSS</a> על מנת לעקוב באופן רציף אחרי תוספות לאתר.
</p>

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> - {{ post.date | date: "%d/%m/%Y" }}
    </li>
  {% endfor %}
</ul>