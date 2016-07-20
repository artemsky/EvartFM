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
                <div class="@{{%= day.classes %}}" data-id="@{{%= day.date.format("YYYY/MM/DD") %}}"><span class="day-number">@{{%= day.day %}}</span></div>
                @{{% }); %}}
            </div>
        </div>
        <div class="event-listing">
            <div class="event-listing-title month-title">
                <span class="glyphicon glyphicon-plus pull-right"></span>
                <span class="glyphicon glyphicon-chevron-up pull-left"></span>
                <span class="event-title">EVENTS THIS MONTH</span>
            </div>
            <div class="event-items">
                @{{% _.each(eventsThisMonth, function(event) { %}}
                <div class="event-item" data-id="@{{%= event.id %}}" data-edit="Edit">
                    <div class="event-item-info">
                        <div class="event-item-name">@{{%= event.title %}}</div>
                        <div class="event-item-location">@{{%= event.location %}}</div>
                    </div>
                    <div class="event-item-time" data-datetime="@{{%= moment(event.date).format("YYYY/MM/DD HH:mm") %}}">@{{%= moment(event.date).format("ddd DD") %}}</div>
                </div>
                @{{% }); %}}
            </div>
            <div class="event-listing-title day-title">
                <span class="glyphicon glyphicon-plus pull-right"></span>
                <span class="glyphicon glyphicon-chevron-down pull-left"></span>
                <span class="event-title">EVENTS THIS DAY</span>
            </div>
            <div class="day-events"></div>

        </div>
    </div>
</script>

<script type="text/template" id="day-events">
    @{{% _.each(eventsThisDay, function(event) { %}}
    <div class="event-item" data-edit="Edit">
        <div class="event-item-info" data-id="@{{%= event.id %}}">
            <div class="event-item-name">@{{%= event.title %}}</div>
            <div class="event-item-location">@{{%= event.location %}}</div>
        </div>
        <div class="event-item-time" data-datetime="@{{%= moment(event.date).format("YYYY/MM/DD HH:mm") %}}">@{{%= moment(event.date).format("HH:mm") %}}</div>
    </div>
    @{{% }); %}}
</script>