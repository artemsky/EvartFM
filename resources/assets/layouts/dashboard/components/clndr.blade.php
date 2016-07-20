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
               <div class="@{{%= day.classes %}}" id="@{{%= day.id %}}"><span class="day-number">@{{%= day.day %}}</span></div>
             @{{% }); %}}
            </div>
        </div>
        <div class="event-listing">
            <div class="event-listing-title">EVENTS THIS MONTH</div>
            <div class="event-items">
                @{{% _.each(eventsThisMonth, function(event) { %}}
                <div class="event-item">
                    <div class="event-item-info">
                        <div class="event-item-name">@{{%= event.title %}}</div>
                        <div class="event-item-location">@{{%= event.location %}}</div>
                    </div>
                    <div class="event-item-time">@{{%= moment(event.date).format("HH:mm") %}}</div>
                </div>
                @{{% }); %}}
            </div>
        </div>
    </div>
</script>