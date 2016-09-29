<section id="support">
    <div class="container">
        <div class="col-sm-6">
            <div class="row">
                <div class="col-md-offset-1 col-md-10">
                    <article>
                        <h3>Evart.FM</h3>
                        <p>Contact Information</p>
                        <span class="ico-home">@yield('contacts-Address')</span>
                        <span class="ico-phone">@yield('contacts-Phone')</span>
                        <span class="ico-cloud">@yield('contacts-Skype')</span>
                        <span class="ico-mail">@yield('contacts-Email')</span>
                    </article>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <h2>Live Support</h2>
            <p>
            </p>
            <form>
                <input class="form-control" type="text" name="name" placeholder="Ф.И.О" />
                <input class="form-control" type="text" name="number" placeholder="Номер телефона" />
                <input class="form-control" type="text" name="country" placeholder="Страна" />
                <textarea name="message" class="form-control" placeholder="Сообщение"></textarea>
                <div class="input-group">
                    <input type="email" name="email" class="form-control" placeholder="Введите электронный адрес" aria-describedby="sendmail">
                    <span class="input-group-addon" id="sendmail">
                        <i class="ico-ok"></i>
                    </span>
                </div>
                <p class="deliverstatus text-center">
                    <!-- Your message has been delivered! -->
                </p>
            </form>
        </div>
    </div>
</section><!-- /#support -->