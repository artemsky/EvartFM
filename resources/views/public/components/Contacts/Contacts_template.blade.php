<section id="support">
    <div class="container">
        <div class="col-sm-6">
            <div class="row">
                <div class="col-md-offset-1 col-md-10">
                    <article>
                        <h3>@lang('public.contacts.title')</h3>
                        <p>@lang('public.contacts.description')</p>
                        <span class="ico-home">@yield('contacts-Address')</span>
                        <span class="ico-phone">@yield('contacts-Phone')</span>
                        <span class="ico-cloud">@yield('contacts-Skype')</span>
                        <span class="ico-mail">@yield('contacts-Email')</span>
                    </article>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <h2>@lang('public.contacts.form.title')</h2>
            <p>
            </p>
            <form>
                <input class="form-control" type="text" name="name" placeholder="@lang('public.contacts.form.name')" />
                <input class="form-control" type="text" name="number" placeholder="@lang('public.contacts.form.phone')" />
                <input class="form-control" type="text" name="country" placeholder="@lang('public.contacts.form.country')" />
                <textarea name="message" class="form-control" placeholder="@lang('public.contacts.form.message')"></textarea>
                <div class="input-group">
                    <input type="email" name="email" class="form-control" placeholder="@lang('public.contacts.form.email')" aria-describedby="sendmail">
                    <span class="input-group-addon" id="sendmail">
                        <i class="ico-ok"></i>
                    </span>
                </div>
                <p class="deliverstatus text-center">
                    <span class="success">@lang('public.contacts.form.status.success')</span>
                    <span class="error">@lang('public.contacts.form.status.error')</span>
                </p>
            </form>
        </div>
    </div>
</section><!-- /#support -->