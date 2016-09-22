<script type="text/template" id="full-clndr-template">
    <div class="clndr-controls">
        <div class="clndr-previous-button">&lt;</div>
        <div class="clndr-next-button">&gt;</div>
        <div class="current-month">
            @{{%= month %}} @{{%= year %}}
        </div>

    </div>
    <div class="clndr-content">
        <div class="clndr-grid">
            <div class="days-of-the-week clearfix">
                @{{% _.each(daysOfTheWeek, function(day) { %}}
                <div class="header-day">@{{%= day %}}</div>
                @{{% }); %}}

            </div>
            <div class="days">
                @{{% _.each(days, function(day) { %}}
                @{{%
                    var eventIDs = [];
                    day.events.forEach(function(val){
                        eventIDs.push(val.id);
                    });
                 %}}
                <div class="@{{%= day.classes %}}" data-date="@{{%= day.date.format("YYYY/MM/DD") %}}" data-id="@{{%= eventIDs.join('|') %}}">
                    <span class="day-number">@{{%= day.day %}}</span>
                </div>
                @{{% }); %}}
            </div>
        </div>
        <div class="event-listing">

            <div class="event-listing-title day-title">
                <span class="glyphicon glyphicon-plus pull-right"></span>
                <span class="glyphicon glyphicon-chevron-down pull-left"></span>
                <span class="event-title">@lang('dashboard.components.scheduler.event.day')</span>
            </div>
            <div class="day-events"></div>

            <div class="event-listing-title month-title">
                <span class="glyphicon glyphicon-plus pull-right"></span>
                <span class="glyphicon glyphicon-chevron-up pull-left"></span>
                <span class="event-title">@lang('dashboard.components.scheduler.event.month')</span>
            </div>
            <div class="event-items" style="display:none">
                @{{%
                    var lastID = null;
                    _.each(eventsThisMonth, function(event) {
                        if(lastID == event.id)
                            return;
                        lastID = event.id;
                %}}
                <div class="event-item" data-id="@{{%= event.id %}}" data-edit="Edit" data-playlist="@{{%= event.playlist %}}">
                <div class="event-item-info">
                <div class="event-item-name">@{{%= event.title %}}</div>
                <div class="event-item-location">@{{%= event.description %}}</div>
                </div>
                <div class="event-item-time" data-datetime="@{{%= moment(event.date).format("YYYY/MM/DD HH:mm") %}}">@{{%= moment(event.date).format("ddd DD") %}}</div>
                <div class="event-item-hover">
                    <span>@lang('dashboard.components.scheduler.event.edit')</span>
                    <span>@lang('dashboard.components.scheduler.event.highlight')</span>
                </div>
                </div>
                @{{% }); %}}
            </div>

        </div>
    </div>
</script>

<script type="text/template" id="day-events">
    @{{% _.each(eventsThisDay, function(event) { %}}
    <div class="event-item" data-edit="Edit" data-id="@{{%= event.id %}}" data-playlist="@{{%= event.playlist %}}">
        <div class="event-item-info">
            <div class="event-item-name">@{{%= event.title %}}</div>
            <div class="event-item-location">@{{%= event.description %}}</div>
        </div>
        <div class="event-item-time" data-datetime="@{{%= moment(event.date).format("YYYY/MM/DD HH:mm") %}}">@{{%= moment(event.date).format("HH:mm") %}}</div>
        <div class="event-item-hover">
            <span>@lang('dashboard.components.scheduler.event.edit')</span>
            <span>@lang('dashboard.components.scheduler.event.highlight')</span>
        </div>
    </div>
    @{{% }); %}}
</script>