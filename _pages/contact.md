---
title: Contact
layout: default
permalink: /contact/
full_width: true
description: How to reach the WVU Radio Astronomy Instrumentation Lab — email, phone, and where to find us on the Evansdale Campus in Morgantown, West Virginia.
---
{%- assign pi = site.data.people.pi | first -%}
<div class="page-head">
   <div class="container">
      <p class="eyebrow">Contact</p>
      <h1>Get in touch</h1>
      <p class="lead">
         We're glad to hear from students, collaborators, and anyone curious about what
         we're building.
      </p>
   </div>
</div>

<section class="section">
   <div class="container">
      <div class="section-head">
         <div>
            <p class="eyebrow">Who to ask</p>
            <h2>Start here</h2>
         </div>
         <p>
            Most questions are answered fastest by going straight to the right person
            rather than the general lab address.
         </p>
      </div>

      <div class="contact-cards">
         <div class="contact-card">
            <h3>Prospective students</h3>
            <p>
               Graduate or undergraduate, and whether or not you've settled on a project —
               write to the PI directly. Mention what you've built or studied.
            </p>
            {%- if pi.email %}
            <a class="btn btn--primary" href="mailto:{{ pi.email }}?subject=Joining%20RAIL">
               {% include icon.html name="mail" %} {{ pi.email }}
            </a>
            {%- endif %}
            <p class="contact-card-who">{{ pi.name }} &middot; {{ pi.office }}</p>
         </div>

         <div class="contact-card">
            <h3>Collaboration &amp; instruments</h3>
            <p>
               Questions about CHIME, CHORD, HIRAX, the outrigger stations, or any of the
               hardware and software described in our papers.
            </p>
            <a class="btn" href="mailto:{{ site.email }}">
               {% include icon.html name="mail" %} {{ site.email }}
            </a>
            <p class="contact-card-who">General lab address</p>
         </div>

         <div class="contact-card">
            <h3>Code &amp; data</h3>
            <p>
               Firmware, control software, and analysis pipelines are public. Issues and
               pull requests are usually the quickest route.
            </p>
            <a class="btn" href="https://github.com/WVURAIL">
               {% include icon.html name="github" %} RAIL code on GitHub
            </a>
            <p class="contact-card-who">Open an issue on the relevant repository</p>
         </div>
      </div>
   </div>
</section>

<section class="section section--tint">
   <div class="container">
      <div class="join-grid">
         <div>
            <p class="eyebrow">Find us</p>
            <h2>Advanced Engineering <br />Research Building</h2>
            <p class="lead">
               The lab is on the WVU Evansdale Campus in Morgantown. Visitors are welcome —
               email ahead so someone's there to let you in.
            </p>
            <div class="btn-row">
               <a class="btn" href="https://www.google.com/maps/search/?api=1&amp;query=Advanced+Engineering+Research+Building+West+Virginia+University+Morgantown+WV">
                  {% include icon.html name="pin" %} Open in Maps
               </a>
            </div>
         </div>

         <ul class="contact-list">
            <li>
               <span class="k">Lab</span>
               <span class="v">Advanced Engineering Research Building, Room&nbsp;304</span>
            </li>
            {%- if pi.office %}
            <li>
               <span class="k">PI office</span>
               <span class="v">{{ pi.office }}</span>
            </li>
            {%- endif %}
            <li>
               <span class="k">Mail</span>
               <span class="v">
                  Lane Department of Computer Science<br />and Electrical Engineering<br />
                  109 Research Way<br />
                  West Virginia University<br />
                  Morgantown, WV 26506
               </span>
            </li>
            {%- if pi.phone %}
            <li>
               <span class="k">Phone</span>
               <span class="v"><a href="tel:+1{{ pi.phone | remove: '(' | remove: ')' | remove: ' ' | remove: '-' }}">{{ pi.phone }}</a></span>
            </li>
            {%- endif %}
         </ul>
      </div>
   </div>
</section>
{%- comment %}No join.html here on purpose: the header's Contact button lands on
this page, so repeating the recruiting band would duplicate the page itself.{% endcomment %}
