/*
 * 
 *  BlockchainOAUTH v0.1.1.1 *  http://blockchainoauth.com
 *
 *  Designed, Developed and Maintained by Versa
 *  All Work Released Under MIT License
 *  
 *  -- Including this file in the HTML header is the only requirement
 *  -- Everything else, including the loading of dependencies is handled here
 *  
 */

var blockchainoauth_loader;
var blockchainoauth_core = function()
{
    /* 
    
    DONE LIKE THIS SO JQUERY CAN BE INJECTED FIRST IF REQUIRED
    
    */
    ;(function($, window, document, undefined)
    {
        // GLOBAL VARS
        var $this = this;
        var init_bs = false;
        var resize_time = new Date();
        var resize_timeout = false;
        var test_results = '';
        var bs_hooks = {};
        var bs_vars = {};
        var full_results = {};
        
        // PREVENT DUPLICATES
        $.fn.blockchainoauth = function(options)
        {
            this.each(function()
            {
                if(!$.data(this, "plugin_blockchainoauth"))
                {
                    $.data(this, "plugin_blockchainoauth", new plugin(this, options));
                }
            });
            return this;
        };
        
        $.fn.blockchainoauth.plugins = {};
        $.fn.blockchainoauth.patches = {};
        
        // IN-ESCAPABLE INCLUDES
        $.fn.blockchainoauth.defaults = function()
        {
            if(typeof $.fn.blockchainoauth.settings.install === 'undefined')
            {
                $.fn.blockchainoauth.settings.install = true;
            }
            if($.fn.blockchainoauth.settings.install === false)
            {
                $.fn.blockchainoauth.settings.cache = false;
            }
            if($.fn.blockchainoauth.settings.cascade === true && $.fn.blockchainoauth.settings.install != false)
            {
                var defaults = {
                    dependencies: [
                        'crypto',
                        'sha3',
                        'mustache'
                    ],
                    modules: [
                        'templates',
                        'theme'
                    ]
                }
                var modules = $.fn.blockchainoauth.settings.modules;
                var dependencies = $.fn.blockchainoauth.settings.dependencies;
                var d_length = blockchainoauth_functions.array_length(dependencies);
                var m_length = blockchainoauth_functions.array_length(modules);
                if(!$.isArray($.fn.blockchainoauth.settings.dependencies))
                {
                    $.fn.blockchainoauth.settings.dependencies = [];
                }
                if(!$.isArray($.fn.blockchainoauth.settings.modules))
                {
                    $.fn.blockchainoauth.settings.modules = [];
                }
                $.each(defaults.dependencies, function(k, dependency)
                {
                    if($.inArray(dependency, dependencies) < 0 || d_length < 1)
                    {
                        $.fn.blockchainoauth.settings.dependencies.push(dependency);
                    }   
                });
                $.each(defaults.modules, function(k, module)
                {
                    if($.inArray(module, modules) < 0 || m_length < 1)
                    {
                        $.fn.blockchainoauth.settings.modules.push(module);
                    }
                });
            }
        }
        
        // CORE FUNCTIONS
        $.fn.blockchainoauth.core = {
            ago: function(time)
            {
                var date = new Date();
                if(time) date = new Date(time * 1000);
                return jQuery.timeago(date)
            },
            add_action: function(hook, key, bs_module, bs_function, vars)
            {
                if(typeof bs_hooks[hook] == 'undefined') bs_hooks[hook] = {};
                if(typeof bs_vars[hook] == 'undefined') bs_vars[hook] = {};
                if(bs_module.indexOf(".") > -1)
                {
                    var bs_module_array = bs_module.split('.');
                    bs_hooks[hook][key] = $.fn.blockchainoauth[bs_module_array[0]][bs_module_array[1]][bs_function];
                }
                else
                {
                    bs_hooks[hook][key] = $.fn.blockchainoauth[bs_module][bs_function];
                }
                bs_vars[hook][key] = vars;
            },
            add_commas: function(num)
            {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
            apply_actions: function(hook)
            {
                if(
                    typeof bs_hooks[hook] != 'undefined' 
                    && $.isPlainObject(bs_hooks[hook])
                ){
                    $.each(bs_hooks[hook], function(key, func)
                    {
                        func(bs_vars[hook][key]);
                    });
                }
            },
            boot: function(bootstrap, key, html, index, callback)
            {
                var snippet_limit = blockchainoauth_functions.array_length(bootstrap);
                if(key && html)
                {
                    $.fn.blockchainoauth.snippets[key] = html;
                }
                if(index >= snippet_limit - 1)
                {
                    if(callback) callback();
                }
                else
                {
                    $.fn.blockchainoauth.core.bootstrap(index + 1, bootstrap, callback);
                }
            },
            bootstrap: function(index, bootstrap, callback)
            {
                var html = false;
                var bs = $.fn.blockchainoauth;
                var $bs = blockchainoauth_functions;
                var key = bootstrap[index];
                var url = bs.settings.core_base + 'html/bootstrap/' + key;

                $('.bs.installing').attr('data-loading-content','Now Installing ' + (index + 1) + ' of  '+blockchainoauth_functions.array_length(bootstrap)+' Bootstrap Snippets');

                var store = false;
                var refresh = blockchainoauth_functions.vars('refresh');
                var snippet = localStorage.getItem('nw_boot_'+key);
                var cache = $.fn.blockchainoauth.settings.cache;
                if(cache.bootstrap === true) store = true;

                if(snippet && store && refresh !== true)
                {
                    bs.core.boot(bootstrap, key, snippet, index, callback);
                }
                else
                {
                    bs.core.get(url, 'html', function(html)
                    {
                        if(store === true)
                        {
                            localStorage.setItem('nw_boot_'+key, html);
                        }
                        bs.core.boot(bootstrap, key, html, index, callback);
                    });
                }
            },
            buttons: function(classes, ids)
            {
                var bs = $.fn.blockchainoauth;
                var button_ids = bs.settings.buttons.ids;
                var button_classes = bs.settings.buttons.classes;
                if(typeof classes != 'undefined' && $.isArray(classes))
                {
                    button_classes = classes;
                }
                if(typeof ids != 'undefined' && $.isArray(ids))
                {
                    button_ids = ids;
                }
                if($.isArray(button_ids))
                {
                    $.each(button_ids, function(k, id_name)
                    {
                        var key = id_name;
                        var id_name = '#' + key;
                        key = key.replace(/-/g, '_');
                        $(bs.element).on('click', id_name, function(e)
                        {
                            if($.isPlainObject(bs.buttons) && $.isFunction(bs.buttons[key]))
                            {
                                bs.buttons[key](this, e);
                            }
                            else if($.isPlainObject(bs.theme) && $.isFunction(bs.theme.buttons[key]))
                            {
                                bs.theme.buttons[key](this, e);
                            }
                        });
                    });
                }
                if($.isArray(button_classes))
                {
                    $.each(button_classes, function(k, class_name)
                    {
                        var key = class_name;
                        class_name = '.btn-' + key;
                        key = key.replace(/-/g, '_');
                        $(bs.element).on('click', class_name, function(e)
                        {
                            if($.isPlainObject(bs.buttons) && $.isFunction(bs.buttons[key]))
                            {
                                bs.buttons[key](this, e);
                            }
                            else if($.isPlainObject(bs.theme) && $.isFunction(bs.theme.buttons[key]))
                            {
                                bs.theme.buttons[key](this, e);
                            }
                        });
                    });
                }
            },
            confirm: function(title, content, confirmed_callback, cancel_callback)
            {
                $('#confirm-modal form, #confirm-modal .btn-success, #confirm-modal .btn-danger').unbind();
                $.fn.blockchainoauth.core.modal(title, content, 'confirm-modal');
                $('#confirm-modal form').bind('submit', function()
                {
                    if(confirmed_callback) confirmed_callback(true);
                });
                $('#confirm-modal .btn-success').bind('click', function()
                {
                    if(confirmed_callback) confirmed_callback(true);
                });
                $('#confirm-modal .btn-danger').bind('click', function()
                {
                    if(cancel_callback) cancel_callback(false);
                });
                $($.fn.blockchainoauth.element).on('hide.bs.modal', '#confirm-modal', function()
                {
                    if(cancel_callback) cancel_callback(false);
                });
            },
            css: function(callback, files)
            {
                var bs = $.fn.blockchainoauth;
                var $bs = blockchainoauth_functions;
                var theme = $.fn.blockchainoauth.settings.theme;
                var core_css = $.fn.blockchainoauth.settings.core_base + 'css/';
                var theme_css = $.fn.blockchainoauth.settings.theme_base + theme + '/css/';
                var css_files = $.fn.blockchainoauth.settings.css;
                var install = $.fn.blockchainoauth.settings.install;
                if(typeof files != 'undefined' && $.isArray(files)) css_files = files;
                if(css_files && $.isArray(css_files) && install === true)
                {
                    var file_len = Object.keys(css_files).length;
                    $.each(css_files, function(k, v)
                    {
                        var called = false;
                        
                        var css = localStorage.getItem('nw_inc_css_'+v);
                        if(blockchainoauth_functions.json(css)) css = $.parseJSON(css);
                        var refresh = blockchainoauth_functions.vars('refresh');
                        var cache = bs.settings.cache;
                        var store = true;
                        if(cache.css === false) store = false;
                        if(!css || refresh === true || store === false) 
                        {
                            // FETCH CSS?
                            blockchainoauth_functions.exists(theme_css+v+'.css', function(success)
                            {
                                if(success === true)
                                {
                                    blockchainoauth_functions.get_css(theme_css+v+'.css', store, v);
                                    if((k+1) >= file_len)
                                    {
                                        if(!called)
                                        {
                                            called = true;
                                            callback();
                                        }
                                    }
                                }
                                else
                                {
                                    blockchainoauth_functions.exists(core_css+v+'.css', function(success)
                                    {
                                        if(success === true)
                                        {
                                            blockchainoauth_functions.get_css(core_css+v+'.css', store, v);
                                            if((k+1) >= file_len)
                                            {
                                                if(!called)
                                                {
                                                    called = true;
                                                    callback();
                                                }
                                            }
                                        }
                                    });
                                }
                            })
                        }
                        else
                        {
                            var styleSheet = document.createElement("link");
                            for(var key in css) 
                            {
                                styleSheet.setAttribute(key, css[key]);
                            }
                            var head = document.getElementsByTagName("head")[0];
                            head.appendChild(styleSheet);
                            if((k+1) >= file_len)
                            {
                                if(!called)
                                {
                                    called = true;
                                    callback();
                                }
                            }
                        }
                    })
                }
                else
                {
                    callback();
                }
            },
            defaults: function()
            {
                if(!$.isPlainObject($.fn.blockchainoauth.data))
                {
                    var data_functions = {
                        find: function(col, key, callback)
                        {
                            if(callback) callback(false);
                        },
                        save: function(col, key, value, callback)
                        {
                            if(callback) callback(value);
                        }
                    }
                    $.fn.blockchainoauth.data = data_functions;
                }
                if(!$.isPlainObject($.fn.blockchainoauth.security))
                {
                    var security_functions = {
                        logged_in: function()
                        {
                            return true;
                        }
                    }
                    $.fn.blockchainoauth.security = security_functions;
                }
            },
            filter: function(data)
            {
                var filters = false;
                var bs = $.fn.blockchainoauth;
                if($.isPlainObject(bs.filters))
                {
                    filters = $.fn.blockchainoauth.filters;
                }
                if($.isPlainObject(bs.theme) && $.isPlainObject(bs.theme.filters))
                {
                    filters = $.extend({}, filters, bs.theme.filters);
                }
                if(filters)
                {
                    $.each(data, function(k, v)
                    { 
                        if($.isPlainObject(v) && v.func && $.isFunction(filters[v.func]))
                        {
                            data[k] = filters[v.func]($.fn.blockchainoauth, v);
                        }
                        else if($.isPlainObject(v) || $.isArray(v))
                        {
                            data[k] = $.fn.blockchainoauth.core.filter(v);
                        }
                    });
                    return data;
                }
                else
                {
                    return data;
                }
            },
            forms: function()
            {
                // PERHAPS FORMS NEEDS ITS OWN MODULE...?
                var backup = '';
                if(localStorage)
                {
                    var objs = {};
                    $.each(localStorage, function(key, value)
                    {
                        var obj = value;
                        if(blockchainoauth_functions.json(value))
                        {
                            obj = $.parseJSON(value);
                        }
                        if(key.substring(0, 12) == 'nw_accounts_')
                        {
                            if(!$.isArray(objs['nw_accounts']))
                            {
                                objs['nw_accounts'] = [];
                            }
                            objs['nw_accounts'].push(obj);
                        }
                        else if(key.substring(0, 12) == 'nw_contacts_')
                        {
                            if(!$.isArray(objs['nw_contacts']))
                            {
                                objs['nw_contacts'] = [];
                            }
                            objs['nw_contacts'].push(obj);
                        }
                        else if(key.substring(0, 14) == 'nw_blockchainoauth_')
                        {
                            var key_array = key.split('_blockchainoauth_');
                            if(!$.isPlainObject(objs['nw_blockchainoauth']))
                            {
                                objs['nw_blockchainoauth'] = {};
                            }
                            objs['nw_blockchainoauth'][key_array[1]] = obj;
                        }
                        else if(key.substring(0, 8) == 'nw_keys_')
                        {
                            var key_array = key.split('_keys_');
                            if(!$.isPlainObject(objs['nw_keys']))
                            {
                                objs['nw_keys'] = {};
                            }
                            objs['nw_keys'][key_array[1]] = obj;
                        }
                    });
                }
                var backup = JSON.stringify(objs);
                $($.fn.blockchainoauth.element).find('textarea.data-backup').val(backup);
                $($.fn.blockchainoauth.element).find('input.filestyle').each(function(i)
                {
                    var input = $(this);
                    $(this).filestyle({
                        iconName: 'glyphicon-inbox'
                    });
                    $(this).on('change', function(i)
                    {
                        $.fn.blockchainoauth.core.image(this, function(img)
                        {
                            $(input).attr('data-img', img);
                        });
                    });
                });
                $($.fn.blockchainoauth.element).find("input.switch").each(function()
                {
                    $(this).bootstrapSwitch();
                    $(this).on('switchChange.bootstrapSwitch', function(event, state) {
                        $(this).val(state);
                    });
                });
                $($.fn.blockchainoauth.element).on('change', '.bs-dobs', function(i)
                {
                    var field = $(this).parent().find('input[type="hidden"]');
                    var day = $(this).parent().find('.bs-dob-day').val();
                    var month = $(this).parent().find('.bs-dob-month').val();
                    var year = $(this).parent().find('.bs-dob-year').val();
                    $(field).val(day + '_' + month + '_' + year);
                });
                $($.fn.blockchainoauth.element).on('change', 'input#import_file', function(i)
                {
                    $.fn.blockchainoauth.core.txt(this, function(txt)
                    {
                        $($.fn.blockchainoauth.element).find('textarea#import-data').val(txt);
                        $($.fn.blockchainoauth.element).find('button#submit-import').trigger('click');
                    });
                });
                $($.fn.blockchainoauth.element).on('change', '#access-account', function(i)
                {
                    var value = $(this).val();
                    var account_id = $(this).attr('data-account-id');
                    if(value === 'print')
                    {
                        // DEFINITELY NOT CORE MATERIAL
                        // DIRTY HACK FOR ADAMS DEMO
                        var modal = $(this).parent().parent().parent().parent().parent().parent().parent();
                        var title = $(modal).find('.modal-title').html();
                        var contents = $(modal).find('.modal-body').html();
                        $.fn.blockchainoauth.core.print(title + contents);
                    }
                    else if(value === 'access')
                    {
                        $.fn.blockchainoauth.accounts.access(account_id);
                    }
                });
                $($.fn.blockchainoauth.element).find('.bs-blockchain-select').each(function(i)
                {
                    var select = $(this);
                    var blockchains = $.fn.blockchainoauth.settings.blockchains;
                    $(select).html('');
                    if($.isPlainObject(blockchains))
                    {
                        $(select).append('<option value="">-- Select Blockchain --</option>');
                        $.each(blockchains, function(blockchain, v)
                        {
                            if(typeof v.private == 'undefined')
                            {
                                if(typeof v.apis[$.fn.blockchainoauth.settings.api_service] != 'undefined')
                                {
                                    $(select).append('<option value="'+blockchain+'">'+v.blockchain+'</option>');
                                }
                            }
                        });
                    }
                });
                $($.fn.blockchainoauth.element).find('.bs-account-select').each(function(i)
                {
                    var select = $(this);
                    var accounts = $.fn.blockchainoauth.accounts.get();
                    $(select).html('');
                    if($.isArray(accounts))
                    {
                        if(blockchainoauth_functions.array_length(accounts) === 1)
                        {
                            $(select).append('<option value="' + accounts[0].id + '">' + accounts[0].name + ' (' + accounts[0].blockchain.type + ')</option>');
                        }
                        else
                        {
                            $(select).append('<option value="">-- Select Account --</option>');
                            $.each(accounts, function(k, account)
                            {
                                $(select).append('<option value="' + account.id + '">' + account.name + ' (' + account.blockchain.type + ')</option>');
                            });
                        }
                    }
                });
                $($.fn.blockchainoauth.element).on('submit', '#blockchainoauth-login', function(e)
                {
                    e.preventDefault();
                    $(this).find('button[type="submit"]').trigger('click');
                });
                $($.fn.blockchainoauth.element).on('submit', '#verify-ownership', function(e)
                {
                    e.preventDefault();
                    $(this).find('button[type="submit"]').trigger('click');
                });
                $($.fn.blockchainoauth.element).on('submit', '#search-form', function(e)
                {
                    e.preventDefault();
                    $.fn.blockchainoauth.core.modal('Warning', 'Search functionality will be available in the next major update');
                });
            },
            get: function(file, extension, callback, skip, cached)
            {
                var bs = $.fn.blockchainoauth;
                var $bs = blockchainoauth_functions;
                var saved_file = localStorage.getItem('nw_inc_file_'+file+'_'+extension);
                if($bs.json(saved_file)) saved_file = $.parseJSON(saved_file);
                var refresh = $bs.vars('refresh');
                var store = true;
                var cache = bs.settings.cache;
                if(typeof cache != 'undefined' && cache[extension] === false)
                {
                    store = false;
                }
                if(refresh === true) cached = false;
                if(!saved_file || refresh === true || store === false || skip === true)
                {
                    if(typeof cache == 'undefined') cache = true;
                    if(typeof skip == 'undefined' || !skip)
                    {
                        $.ajax({
                            url: file + '.' + extension,
                            dataType: extension,
                            cache: cached,
                            success: function(results)
                            {
                                if(store === true)
                                {
                                    localStorage.setItem('nw_inc_file_'+file+'_'+extension, JSON.stringify(results));
                                }
                                if(callback) callback(results, file, extension);
                            },
                            error: function(results)
                            {
                                if(store === true)
                                {
                                    localStorage.setItem('nw_inc_file_'+file+'_'+extension, JSON.stringify(results));
                                }
                                if(callback) callback(results, file, extension);
                            }
                        });
                    }
                    else
                    {
                        if(callback) callback({}, file, extension);
                    }
                }
                else
                {
                    if(callback) callback(saved_file, file, extension);
                }
            },
            image: function(input, callback)
            {
                if(input.files && input.files[0]) 
                {
                    var reader = new FileReader();
                    reader.onload = function(e) 
                    {
                        var image = e.target.result;
                        callback(image);
                    };       
                    reader.readAsDataURL(input.files[0]);
                }
            },
            init: function()
            {
                var bs = $.fn.blockchainoauth;
                var $bs = blockchainoauth_functions;
                
                bs.core.apply_actions('init');
                
                $.fn.blockchainoauth.core.publicize(function()
                {
                    // CALLBACK UPON COMPLETION
                    var init_callback = function(nav)
                    {       
                        bs.core.modals();
                        bs.core.buttons();

                        if($.isPlainObject(bs.styles))
                        {
                            bs.styles.set();
                        }

                        if(nav)
                        {
                            bs.core.nav(nav);
                        }

                        bs.core.loader('close');

                        if($(bs.element).length > 0)
                        {
                            // SMOOTHER FADE-IN
                            $(bs.element).animate({'opacity':1}, 600, function()
                            {
                                bs.core.apply_actions('init_callback');
                                $(window).resize(function(e)
                                {
                                    bs.core.resize();
                                })
                            });
                        }
                        else
                        {
                            bs.core.apply_actions('init_callback');
                            $(window).resize(function(e)
                            {
                                bs.core.resize();
                            })
                        }   
                    }
                                               
                    // RESET IF REQUIRED
                    if($bs.vars('reset') === true)
                    {
                        bs.core.reset(true);
                    }
                    else if(!init_bs)
                    {
                        init_bs = true;
                        // CHECK FOR LOGIN STATUS
                        if(!bs.security.logged_in())
                        {
                            var url = '../../../blockchainoauth/html/bootstrap/login';
                            bs.templates.render(url, function()
                            {
                                init_callback();
                            });
                        }
                        else
                        {
                            if(typeof bs.accounts != 'undefined' && $.isPlainObject(bs.accounts))
                            {
                                if(
                                    typeof bs.settings.cache == 'undefined'
                                    || bs.settings.cache == false
                                ){
                                    bs.settings.cache = {};
                                    bs.settings.cache.accounts = 60000;
                                }
                                setInterval(function()
                                {
                                    bs.accounts.poll();
                                }, bs.settings.cache.accounts);
                            }
                            if(window.location.hash)
                            {
                                $.fn.blockchainoauth.core.refresh(function()
                                {
                                    init_callback(window.location.hash.substring(1));
                                }, $bs.slug(window.location.hash), false);
                            }
                            else
                            {
                                $.fn.blockchainoauth.templates.render(bs.settings.page_base, function()
                                {
                                    init_callback();
                                }, true);
                            }
                            var run_tests = false;
                            var tests = $bs.vars('tests');
                            if(tests || bs.settings.test === true) run_tests = true;
                            bs.core.tests(run_tests);
                        }
                    } 
                });
            },
            less: function(callback)
            {
                var use_less = true;
                if($.fn.blockchainoauth.settings.less === false) use_less = false;
                if(use_less)
                {
                    var less = localStorage.getItem('nw_inc_less');
                    if(blockchainoauth_functions.json(less)) less = $.parseJSON(less);
                    var refresh = blockchainoauth_functions.vars('refresh');
                    var cache = $.fn.blockchainoauth.settings.cache;
                    var store = true;
                    if(cache.less === false) store = false;
                    if(!less || refresh === true || store === false) 
                    {
                        $('head').append('<link rel="stylesheet/less" type="text/css" href="' + $.fn.blockchainoauth.settings.theme_base + $.fn.blockchainoauth.settings.theme + '/less/blockchainoauth.less">');
                        blockchainoauth_functions.js('js-blockchainoauth-less', $.fn.blockchainoauth.settings.core_base+'js/less.js', function()
                        {
                            var less_styles = false;
                            $('style').each(function()
                            {
                                // less-blockchainoauth
                                var id = $(this).attr('id');
                                var string_to_count = 'less-blockchainoauth';
                                var string_length = string_to_count.length;
                                if(id)
                                {
                                    var check = id.substring(0, 5);
                                    var double_check = id.substring((id.length - string_length), id.length);
                                    if(check === 'less:' && double_check === 'less-blockchainoauth')
                                    {
                                        less_styles = $(this).html();
                                    }
                                    if(less_styles)
                                    {
                                        if(store)
                                        {
                                            localStorage.setItem('nw_inc_less', JSON.stringify(less_styles));
                                        }
                                        if(callback) callback();
                                    }
                                }
                            })
                        });
                    }
                    else
                    {
                        $('head').append('<style id="nw-css">'+less+'</style>');
                        if(callback) callback();
                    }
                }
                else
                {
                    if(callback) callback();
                }
            },
            loaded: function()
            {
                if($($.fn.blockchainoauth.element).length < 1)
                {
                    return false;
                }
                else
                {
                    $.fn.blockchainoauth.core.defaults();
                    $.fn.blockchainoauth.core.init();
                }
            },
            loader: function(state)
            {
                var element = $($.fn.blockchainoauth.element);
                if(state && state === 'open')
                {
                    $(element).animate({'opacity': 0}, 350, function()
                    {
                        $(element).addClass('loading');
                        $(element).animate({'opacity': 1}, 150, function()
                        {

                        });
                    });
                }
                else if(state && state === 'close')
                {
                    $(element).animate({'opacity': 0}, 350, function()
                    {
                        $(element).removeClass('loading');
                        $(element).removeClass('installing');
                        $(element).animate({'opacity': 1}, 150, function()
                        {

                        });
                    });
                }
                else
                {
                    if($(element).hasClass('loading'))
                    {
                        $(element).removeClass('loading');
                    }
                    else
                    {
                        $(element).addClass('loading');
                    }
                }
                    
            },
            modal: function(title, content, id)
            {
                var selector = $('#default-modal');
                if(id) selector = $('#'+id);
                if(title) $(selector).find('.modal-title').html(title);
                if(content) $(selector).find('.modal-body').html(content);
                $(selector).modal('show');
            },
            modals: function(action)
            {
                if(action)
                {
                    if(action === 'close_all')
                    {
                        $($.fn.blockchainoauth.element).find('.modal').each(function(i)
                        {
                            $(this).modal('hide');
                        });
                        $('body').removeClass('modal-open');
                    }
                }
                else
                {
                    $($.fn.blockchainoauth.element).on('show.bs.modal', '.modal', function(i)
                    {
                        var this_id = $(this).attr('id');
                        var this_form = $(this).find('form');
                        $($.fn.blockchainoauth.element).find('.modal').each(function(i)
                        {
                            if($(this).attr('id') != this_id)
                            {
                                $(this).modal('hide');
                            }
                        });
                        $(this_form).find('label.hidden-label').each(function(i)
                        {
                            var wrapper = $(this).parent();
                            $(wrapper).hide(0);
                        })
                        $(this).find('.qr-holder').each(function()
                        {
                            if($(this).find('img').length > 0)
                            {
                                $(this).find('img').remove();
                            }
                            $(this).qrcode({
                                render: 'image',
                                text: $(this).attr('data-content')
                            });
                        });
                        if($(this).find('.form-control').length > 0)
                        {
                            var input = $(this).find('.form-control[type!=hidden]:first');
                            $(input).focus();
                        }
                    });
                    $($.fn.blockchainoauth.element).on('shown.bs.modal', '.modal', function(i)
                    {
                        // .on('show.bs.modal') usually works best...
                        if($(this).find('.form-control').length > 0)
                        {
                            var input = $(this).find('.form-control[type!=hidden]:first');
                            $(input).focus();
                        }
                    });
                    $($.fn.blockchainoauth.element).on('show.bs.modal', '#new-account-modal', function(i)
                    {
                        if($(this).find('#more-security').html() == 'Less Security')
                        {
                            $(this).find('#more-security').trigger('click');
                        }
                    });
                }
            },
            nav: function(slug)
            {
                if(slug == $.fn.blockchainoauth.settings.page_base) slug = $.fn.blockchainoauth.settings.slug_base;
                var nav = $($.fn.blockchainoauth.element).find('#' + $.fn.blockchainoauth.settings.navigation_id);
                var mnav = $($.fn.blockchainoauth.element).find('#' + $.fn.blockchainoauth.settings.mobile_nav_id);
                $(nav).find('.active').removeClass('active');
                $(mnav).find('.active').removeClass('active');
                if(slug.charAt(0) != '#') slug = '#' + slug;
                $(nav).find(slug).addClass('active');
                $(mnav).find(slug).addClass('active');
            },
            option: function(key, default_value)
            {
                if(!default_value) default_value = false;
                var bs = $.fn.blockchainoauth;
                var $bs = blockchainoauth_functions;
                var options = localStorage.getItem('nw_blockchainoauth_options');
                if($bs.json(options)) options = $.parseJSON(options);
                if(
                    $.isPlainObject(options) 
                    && typeof options[key] != 'undefined'
                ){
                    default_value = options[key];
                }
                if(!default_value && typeof bs.settings[key] != 'undefined')
                {
                    default_value = bs.settings[key];
                }   
                return default_value;
            },
            page: function()
            {
                if(window.location.hash)
                {
                    var slug_array = window.location.hash.split('#');
                    $.fn.blockchainoauth.settings.page = slug_array[1];
                }
                else
                {
                    $.fn.blockchainoauth.settings.page = $.fn.blockchainoauth.settings.page_base;
                }
                return $.fn.blockchainoauth.settings.page;
            },
            patch: function(version, callback)
            {
                var file = $.fn.blockchainoauth.settings.core_base+'patches/'+version+'/patch-'+version+'.js';
                $.getScript(file, function(patch_js)
                {
                    $.fn.blockchainoauth.patches['patch'+version].init(callback)
                });
            },
            plugins: function(index, plugins, callback)
            {
                var bs = $.fn.blockchainoauth;
                var $bs = blockchainoauth_functions;
                if(!index) index = 0;
                
                $('.bs.installing').attr('data-loading-content','Now Installing ' + (index + 1) + ' of  '+blockchainoauth_functions.array_length(plugins)+' Plugins');
                
                var install = $.fn.blockchainoauth.settings.install;
                
                if(install === false)
                {
                    if(callback) callback();
                }
                else if($.isArray(plugins))
                {
                    var plugin = plugins[index];
                    var plugin_url = 'plugins/' + plugin + '/' + plugin + '.js';
                    // Need to cache plugin?
                    var plug = localStorage.getItem('nw_inc_plugin_'+plugin);
                    if(blockchainoauth_functions.json(plug)) plug = $.parseJSON(plug);
                    var refresh = blockchainoauth_functions.vars('refresh');
                    var cache = bs.settings.cache;
                    var store = true;
                    if(cache.plugins === false) store = false;
                    if(!plug || refresh === true || store === false) 
                    {
                        $.getScript(plugin_url, function(plugin_js)
                        {
                            if(store === true && plugin_js)
                            {
                                localStorage.setItem('nw_inc_plugin_'+plugin, JSON.stringify(plugin_js));
                            }
                            if(index >= $bs.array_length(plugins) - 1)
                            {
                                if(callback) callback();
                            }
                            else
                            {
                                bs.core.plugins(index + 1, plugins, callback);
                            }
                        });   
                    }
                    else
                    {
                        var head = document.getElementsByTagName('head')[0];
                        var new_script = document.createElement("script");
                        new_script.setAttribute('type', 'text/javascript');
                        new_script.setAttribute('id', plugin);
                        new_script.text = plug;
                        head.appendChild(new_script);
                        if(index >= $bs.array_length(plugins) - 1)
                        {
                            if(callback) callback();
                        }
                        else
                        {
                            bs.core.plugins(index + 1, plugins, callback);
                        }
                    }
                }
            },
            print: function(contents)
            {
                var mywindow = window.open('', 'my div', 'height=500,width=400');
                mywindow.document.write('<html><head><title>my div</title>');
                mywindow.document.write('<style>.btn { display: none; }</style>');
                mywindow.document.write('</head><body >');
                mywindow.document.write(contents);
                mywindow.document.write('</body></html>');
                mywindow.print();
                mywindow.close();
                return true;
            },
            publicize: function(callback)
            {
                var bs = $.fn.blockchainoauth;
                var public = bs.settings.public;
                var security = bs.settings.security;
                if(public === true)
                {
                    if(!$.isPlainObject(bs.data) || !$.isFunction(bs.data.item))
                    {
                        bs.core.modal('Warning', 'Data Module Required for Publication Mode');
                    }
                    else
                    {
                        bs.data.find('blockchainoauth', 'salt', function(salt)
                        {
                            if(salt)
                            {
                                var obj = CryptoJS.SHA3(salt, { outputLength: 512 });
                                var hash = obj.toString().substring(0, 32);
                                if(!security && hash != security)
                                {
                                    $.fn.blockchainoauth.core.add_action(
                                        'init_callback', 
                                        'update_security',
                                        'security', 
                                        'update', 
                                        hash
                                    );
                                    if(callback) callback();
                                }
                                else
                                {
                                    if(security)
                                    {
                                        $.fn.blockchainoauth.settings.role = 'admin';
                                    }
                                    else
                                    {
                                        $.fn.blocksytrap.settings.role = 'user';
                                    }
                                    if(callback) callback();
                                }
                            }
                            else
                            {
                                if(security)
                                {
                                    $.fn.blockchainoauth.settings.role = 'user';
                                }
                                if(callback) callback();
                            }
                        });
                    }
                }
                else
                {
                    if(callback) callback();
                }
            },
            ready: function()
            {
                /* 

                THESE FUNCTIONS NEED TO RUN EVERY TIME
                NEW HTML IS LOADED INTO THE DOM
                
                TODO: Make tables and forms optional...?

                */
                $.fn.blockchainoauth.core.table();
                $.fn.blockchainoauth.core.forms();
                $.fn.blockchainoauth.core.page();
                $.fn.blockchainoauth.core.nav($.fn.blockchainoauth.core.page());

                // TODO: 
                // Handle inactive modules?
                if($.isPlainObject($.fn.blockchainoauth.theme))
                {
                    if($.isFunction($.fn.blockchainoauth.theme.new))
                    {
                        $.fn.blockchainoauth.theme.new();
                    }
                }
                if($.isPlainObject($.fn.blockchainoauth.buttons))
                {
                    if($.isFunction($.fn.blockchainoauth.buttons.new))
                    {
                        $.fn.blockchainoauth.buttons.new();
                    }
                }
                $.fn.blockchainoauth.core.apply_actions('ready'); 
            },
            refresh: function(callback, slug)
            {
                var bs = $.fn.blockchainoauth;
                bs.core.modals('close_all');
                bs.core.loader('open');
                if(!slug) slug = bs.settings.page_base;
                bs.templates.render(bs.settings.page_base, function()
                {
                    if(slug != bs.settings.page_base)
                    {
                        bs.templates.render(slug, function()
                        {
                            bs.core.ready();
                            bs.core.loader('close');
                            if(callback) callback();
                        }, false, true);
                    }
                    else
                    {
                        bs.core.ready();
                        bs.core.loader('close');
                        if(callback) callback();
                    }
                }, true, true);
            },
            reset: function(reload)
            {
                var bs = $.fn.blockchainoauth;
                if(reload !== false) reload = true;
                if(localStorage)
                {
                    $.each(localStorage, function(k, v)
                    {
                        var check = k.substring(0, 3);
                        if(check === 'nw_')
                        {
                            localStorage.removeItem(k);
                        }
                    });
                    if(reload)
                    {
                        bs.templates.render(bs.settings.page_base, function()
                        {
                            bs.core.loader('close');
                        }, true);
                    }
                }
            },
            resize: function(delay)
            {
                if(!delay) delay = 200;
                resize_time = new Date();
                if(resize_timeout === false) 
                {
                    resize_timeout = true;
                    setTimeout($.fn.blockchainoauth.core.resized, delay);
                }
            },
            resized: function(delay)
            {
                if(!delay) delay = 200;
                if(new Date() - resize_time < delay) 
                {
                    setTimeout($.fn.blockchainoauth.core.resized, delay);
                } 
                else 
                {
                    resize_timeout = false;
                    /* 

                    THESE FUNCTIONS NEED TO RUN EVERY TIME

                    */
                    $.fn.blockchainoauth.core.table();
                }   
            },
            salt: function(modules, callback, salt)
            {
                if(!salt) salt = $.fn.blockchainoauth.settings.id;
                var keys = [];
                if($.isPlainObject(modules))
                {
                    var count = 0;
                    var key_count = Object.keys(modules).length;
                    if(key_count === count)
                    {
                        callback(salt, keys);
                    }
                    else
                    {
                        $.each(modules, function(k, v)
                        {
                            count++;
                            keys.push(k);

                            if($.isArray($.fn.blockchainoauth.settings.store))
                            {
                                $.each($.fn.blockchainoauth.settings.store, function(store_index, store_key)
                                {
                                    if(store_key === k)
                                    {
                                        if(k == 'your_password') 
                                        {
                                            safe_v = CryptoJS.SHA3(v, { outputLength: 512 }).toString();
                                        }
                                        else
                                        {
                                            safe_v = v;
                                        }
                                        $.fn.blockchainoauth.data.save('keys', store_key, safe_v, function()
                                        {

                                        });
                                    }
                                });
                            }

                            salt = CryptoJS.SHA3(salt+k+blockchainoauth_functions.slug(v), { outputLength: 512 });
                            if(count >= key_count && callback)
                            {
                                callback(salt.toString(), keys);
                            }
                        })
                    }
                }
                else
                {
                    callback(salt, keys);
                }
            },
            settings: function(element)
            {
                $.fn.blockchainoauth.settings.vars = blockchainoauth_functions.vars();
                if(blockchainoauth_functions.vars('less'))
                {
                    $.fn.blockchainoauth.settings.less = true;
                }
                if(!$.fn.blockchainoauth.settings.base_url)
                {
                    var base_url = window.location.href.split('#')[0];
                    $.fn.blockchainoauth.settings.base_url = base_url.split('?')[0];
                }
                $.fn.blockchainoauth.settings.info = {};
                
                // ESTABLISH DEFAULT ELEMENT
                if($(element).attr('src') || !element)
                {
                    element = $('#blockchainoauth');
                }
                $.fn.blockchainoauth.element = element;

                if($($.fn.blockchainoauth.element).length > 0)
                {
                    $($.fn.blockchainoauth.element).addClass('blockchainoauth-wrapper loading');

                    // DATA ATTRIBUTES
                    var attributes = $($.fn.blockchainoauth.element).data();

                    $.each(attributes, function(key, value)
                    {
                        if(typeof value == 'string')
                        {
                            var first_char = value.charAt(0);
                            var last_char = value.charAt(value.length - 1);
                            if(first_char == '[' && last_char == ']')
                            {
                                var keys = value.substr(1, value.length - 2);
                                if(key.indexOf(".") > -1)
                                {
                                    key_array = key.split('.');
                                    if(blockchainoauth_functions.array_length(key_array) == 2)
                                    {
                                        $.fn.blockchainoauth.settings[key_array[0]][key_array[1]] = keys.split(', ');
                                    }
                                }
                                else
                                {
                                    $.fn.blockchainoauth.settings[key] = keys.split(', ');
                                }
                            }
                            else
                            {
                                if(key.indexOf(".") > -1)
                                {
                                    key_array = key.split('.');
                                    if(blockchainoauth_functions.array_length(key_array) == 2)
                                    {
                                        $.fn.blockchainoauth.settings[key_array[0]][key_array[1]] = value;
                                    }
                                }
                                else
                                {
                                    $.fn.blockchainoauth.settings[key] = value;
                                }
                            }
                        }
                        else
                        {
                            $.fn.blockchainoauth.settings[key] = value;
                        }
                    });
                }
            },
            string_to_array: function(string)
            {
                var arrayed_string = false;
                if(typeof string == 'string')
                {
                    var first_char = string.charAt(0);
                    var last_char = string.charAt(string.length - 1);
                    if(first_char == '[' && last_char == ']')
                    {
                        var keys = string.substr(1, string.length - 2);
                        arrayed_string = keys.split(', ');
                    }
                }
                return arrayed_string;
            },
            stringed: function(styles)
            {
                if($.isArray(styles))
                {
                    var style = {};
                    $.each(styles, function(k, v)
                    {
                        var css = v.split(', ');
                        var valued = new String(css).replace('[', '');
                        var value = valued.replace(']', '');
                        var values = value.split(': ');
                        style[values[0]] = values[1];
                    });
                    return style;
                }
            },
            table: function()
            {
                $($.fn.blockchainoauth.element).find('table.data-table').each(function(i)
                {
                    if($(this).hasClass('dataTable'))
                    {
                        // May need to redraw...?
                    }
                    else
                    {
                        var dom = 'tlip';
                        var order_by = 1;
                        var order = 'asc';
                        var search = false;
                        var header_cells = $(this).find('thead tr th');
                        var body_cells = $(this).find('tbody tr td');
                        if($(this).attr('data-search')) search = true;
                        if($(this).attr('data-dom')) dom = $(this).attr('data-dom');
                        if($(this).attr('data-order')) order = $(this).attr('data-order');
                        if($(this).attr('data-order-by')) order_by = parseInt($(this).attr('data-order-by'));
                        $.fn.blockchainoauth.core.table[$(this).attr('id')] = $(this).DataTable({
                            searching: search,
                            dom: dom,
                            order: [ order_by, order ],
                            fnDrawCallback: function(oSettings)
                            {
                                $(header_cells).each(function(i)
                                {
                                    $(this).attr('data-width', $(this).width());
                                })
                            }
                        });
                    }
                });
            },
            test_results: function(expected, given, index, total, title, api_service, chain_count, chain_total)
            {
                var details = '';
                var passed = true;
                var bs = $.fn.blockchainoauth;
                if(typeof full_results[api_service] == 'undefined')
                {
                    full_results[api_service] = {};
                    full_results[api_service].passed = 0;
                    full_results[api_service].failed = 0;
                    full_results[api_service].blockchains = 0;
                    full_results[api_service].addresses = false;
                    full_results[api_service].markets = false;
                    full_results[api_service].paginate = false;
                }
                if($.isPlainObject(expected) || $.isArray(expected))
                {
                    var ex = expected;
                    var give = given;
                    if($.isPlainObject(expected))
                    {
                        expected = [];
                        expected.push(ex);
                        given = [];
                        given.push(give);
                    }
                    $.each(expected, function(key, result)
                    {
                        var expected_count = 0;
                        var expected_total = blockchainoauth_functions.array_length(result);
                        $.each(result, function(field, value)
                        {
                            expected_count++;
                            if(typeof given[key] == 'undefined' || given[key][field] != value) 
                            {
                                if(typeof given[key] == 'undefined') 
                                {
                                    passed = false;
                                    if(expected_count >= expected_total)
                                    {
                                        details+= ' - <small>FUNCTION MISSING</small>';
                                    }
                                }
                                else
                                {
                                    passed = false;
                                    details+= '<br /><small>';
                                    details+= value + ' expected for <strong>' +field+ '</strong>, ';
                                    details+= given[key][field] + ' provided instead';
                                    details+= '</small>';
                                }
                            }
                        });
                    });
                    if(passed === true)
                    {
                        full_results[api_service].passed++;
                        test_results+= '<hr />';
                        test_results+= '<p class="break-word text-success left-aligned">';
                        test_results+= '<strong class="black">API Request using '+api_service+':</strong><br />'+title;
                        test_results+= ': <strong>PASSED</strong></p>';
                    }
                    else
                    {
                        full_results[api_service].failed++;
                        test_results+= '<hr />';
                        test_results+= '<p class="break-word text-danger left-aligned">';
                        test_results+= '<strong class="black">API Request using '+api_service+':</strong><br />'+title;
                        test_results+= ': <strong>FAILED</strong>'+details+'</p>';
                    }
                    if(index >= total && chain_count >= chain_total)
                    {   
                        if($('#default-modal').find('.test-results').length < 1)
                        {
                            $.each(bs.settings.blockchains, function(blockchain, values)
                            {
                                if(blockchain != 'multi')
                                {
                                    $.each(values.apis, function(provider, url)
                                    {
                                        if(typeof full_results[provider] != 'undefined')
                                        {
                                            full_results[provider].blockchains++;
                                            var api_addresses = $.fn.blockchainoauth.api.settings(
                                                blockchain, 
                                                provider, 
                                                'to', 
                                                'addresses'
                                            );
                                            if(
                                                typeof api_addresses != 'undefined'
                                                && api_addresses
                                            ){
                                                full_results[provider].addresses = true;
                                            }
                                            var api_markets = $.fn.blockchainoauth.api.settings(
                                                'multi', 
                                                provider, 
                                                'to', 
                                                'market'
                                            );
                                            if(
                                                typeof api_markets != 'undefined'
                                                && api_markets
                                            ){
                                                full_results[provider].markets = true;
                                            }
                                            var api_paginate = $.fn.blockchainoauth.api.settings(
                                                blockchain, 
                                                provider, 
                                                'to', 
                                                'tx_pagination'
                                            );
                                            if(
                                                typeof api_paginate != 'undefined'
                                                && api_paginate
                                            ){
                                                full_results[provider].paginate = true;
                                            }
                                        }
                                    });
                                }
                            });
                            test_results = $.fn.blockchainoauth.core.test_results_table(full_results) + '<a href="#" class="btn-hidden_toggler btn btn-success btn-block" data-id="full-results">FULL RESULTS</a><div style="display: none" id="full-results">' + test_results + '</div>';
                            $.fn.blockchainoauth.core.modal('Test Results', test_results);
                        }
                        
                    }
                }
            },
            test_results_table: function(results)
            {
                var html = '';
                var sortable = [];
                $.each(results, function(k, v)
                {
                    sortable.push({
                        provider: k,
                        results: v
                    });
                });
                sortable.sort(function(a, b) 
                { 
                    return parseFloat(a.results.blockchains) - parseFloat(b.results.blockchains) 
                });
                sortable.reverse();
                results = {};
                $.each(sortable, function(k, v)
                {
                    results[v.provider] = v.results;
                });
                var headers = ['API Provider', 'Passed', 'Failed', 'Chains', 'Addresses', 'Markets', 'Paginate'];
                html+= '<table class="table table-striped test-results">';
                    html+= '<thead>';
                        html+= '<tr>';
                            $.each(headers, function(k, title)
                            {
                                html+= '<th>'+title+'</th>';
                            });
                        html+= '</tr>';
                    html+= '</thead>';
                    html+= '<tbody>';
                        $.each(results, function(provider, these_results)
                        {
                            html+= '<tr>';
                                html+= '<td><strong>'+provider+'</strong></td>';
                                if(these_results.failed > 0)
                                {
                                    html+= '<td><span class="label label-success">'+these_results.passed+'</span></td>';
                                    html+= '<td><span class="label label-danger">'+these_results.failed+'</span></td>';
                                }
                                else
                                {
                                    html+= '<td><span class="label label-success">'+these_results.passed+'</span></td>';
                                    html+= '<td><span class="label label-success">'+these_results.failed+'</span></td>';
                                }
                                html+= '<td><strong>'+these_results.blockchains+'</strong></td>';
                                html+= '<td>';
                                    if(these_results.addresses === true)
                                    {
                                        html+= '<span class="label label-success">YES</span>';   
                                    }
                                    else
                                    {
                                        html+= '<span class="label label-danger">NO</span>';
                                    }
                                html+= '</td>';
                                html+= '<td>';
                                    if(these_results.markets === true)
                                    {
                                        html+= '<span class="label label-success">YES</span>';   
                                    }
                                    else
                                    {
                                        html+= '<span class="label label-danger">NO</span>';
                                    }
                                html+= '</td>';
                                html+= '<td>';
                                    if(these_results.paginate === true)
                                    {
                                        html+= '<span class="label label-success">YES</span>';   
                                    }
                                    else
                                    {
                                        html+= '<span class="label label-danger">NO</span>';
                                    }
                                html+= '</td>';
                            html+= '</tr>';
                        });
                    html+= '</tbody>';
                html+= '</table>';
                return html;
            },
            tests: function(run)
            {
                if(!run) run = false;
                var bs = $.fn.blockchainoauth;
                var set = false;
                var chain_count = 0;
                var chain_total = 0;
                if(typeof bs.settings.tests !== 'undefined')
                {
                    set = bs.settings.tests.api;
                }
                else
                {
                    run = false;
                }
                if(
                    run 
                    && typeof bs.settings.blockchains != 'undefined' 
                    && typeof bs.settings.blockchains.btc != 'undefined' 
                    && typeof bs.settings.blockchains.btc.apis != 'undefined'
                ){
                    chain_total = blockchainoauth_functions.array_length(bs.settings.blockchains.btc.apis);
                    $.each(bs.settings.blockchains.btc.apis, function(api_service, api_url)
                    {
                        var this_count = 0;
                        var test_count = '5';
                        chain_count++;
                        bs.api.address(set.address.request, 'btc', function(results)
                        {
                            this_count++;
                            bs.core.test_results(
                                set.address.results, 
                                results, 
                                this_count, 
                                test_count,
                                'api.address('+set.address.request+', btc)',
                                api_service,
                                chain_count,
                                chain_total
                            );
                        }, api_service);
                        bs.api.block(set.block.request, 'btc', function(results)
                        {
                            this_count++;
                            bs.core.test_results(
                                set.block.results, 
                                results, 
                                this_count, 
                                test_count,
                                'api.block('+set.block.request+', btc)',
                                api_service,
                                chain_count,
                                chain_total
                            );
                        }, api_service);
                        bs.api.transaction(set.transaction.request, 'btc', function(results)
                        {
                            this_count++;
                            bs.core.test_results(
                                set.transaction.results, 
                                results, 
                                this_count, 
                                test_count,
                                'api.transaction('+set.transaction.request+', btc)',
                                api_service,
                                chain_count,
                                chain_total
                            );
                        }, api_service);
                        bs.api.transactions(set.transactions.request, 'btc', function(results)
                        {
                            this_count++;
                            bs.core.test_results(
                                set.transactions.results, 
                                results, 
                                this_count, 
                                test_count,
                                'api.transactions('+set.transactions.request+', btc)',
                                api_service,
                                chain_count,
                                chain_total
                            );
                        }, api_service);
                        bs.api.unspents(set.unspents.request, 'btc', function(results)
                        {
                            this_count++;
                            bs.core.test_results(
                                set.unspents.results, 
                                results, 
                                this_count, 
                                test_count,
                                'api.unspents('+set.unspents.request+', btc)',
                                api_service,
                                chain_count,
                                chain_total
                            );
                        }, 0, api_service);
                    });
                }
            },
            txt: function(input, callback)
            {
                if(input.files && input.files[0]) 
                {
                    var reader = new FileReader();
                    reader.onload = function(e) 
                    {
                        var image = e.target.result;
                        callback(image);
                    };       
                    reader.readAsText(input.files[0]);
                }
            },
            upgrade: function(saved_version, this_version, refresh, callback)
            {
                var settings = $.fn.blockchainoauth.settings;
                var $bs = blockchainoauth_functions;
                if(typeof saved_version == 'undefined') saved_version = 0;
                if(typeof this_version == 'undefined') this_version = 1;
                if(typeof refresh == 'undefined') refresh = false;
                // TODO: Now need to implement patches!
                if(/^[0-9\.]+$/.test(saved_version) && /^[0-9\.]+$/.test(this_version)) 
                {
                    var current_version_array = this_version.split('.');
                    var stored_version_array = saved_version.split('.');
                    if(
                        $.isArray(stored_version_array)
                        && $.isArray(current_version_array)
                        && blockchainoauth_functions.array_length(current_version_array) > 3
                        && blockchainoauth_functions.array_length(stored_version_array) > 3
                        && stored_version_array[0] < 1
                        && stored_version_array[1] < 5
                    )
                    {
                        $.fn.blockchainoauth.core.patch('0501', function()
                        {
                            $.fn.blockchainoauth.core.patch('0502', callback);
                        });
                    }
                    else if(
                        $.isArray(stored_version_array)
                        && $.isArray(current_version_array)
                        && blockchainoauth_functions.array_length(current_version_array) > 3
                        && blockchainoauth_functions.array_length(stored_version_array) > 3
                        && stored_version_array[1] == 5
                        && stored_version_array[2] == 0
                        && stored_version_array[3] == 1
                    ){
                        $.fn.blockchainoauth.core.patch('0502', callback);
                    }
                    else
                    {
                        callback();
                    }
                }
                else
                {
                    callback();
                }
            }
        };        

        // PLUGIN CONSTRUCTOR
        function plugin(element, options, defaults, store, force_skip)
        {
            // ACCOUNT FOR ORIGINAL SETTINGS IF THIS IS LOADED MANUALLY FOR SECOND TIME
            var old_settngs = {};
            if(typeof $.fn.blockchainoauth.settings != 'undefined')
            {
                old_settings = $.fn.blockchainoauth.settings;
            }
            
            // MERGE DEFAULT AND PLUGIN OPTIONS
            var settings = $.extend(old_settings, defaults, options);
            
            var skip = false;
            if(settings.skip_config) skip = true;
            if(force_skip === true) skip = true
            
            if(typeof $.fn.blockchainoauth.settings.install === 'undefined')
            {
                $.fn.blockchainoauth.settings.install = true;
            }
            
            // THEN GET CONFIG FILE
            $.fn.blockchainoauth.core.get('themes/config', 'json', function(results)
            {
                if($.isPlainObject(results))
                {
                    $.fn.blockchainoauth.settings = $.extend({}, settings, results);
                    
                    // MERGE WITH HTML ATTRBUTE OPTIONS
                    $.fn.blockchainoauth.core.settings(element);
                    
                    if($.fn.blockchainoauth.settings.skip_config) skip = true;
                    
                    // NOW NEED TO GET THEME SPECIFIC OPTIONS AND MERGE WITH THESE
                    var current_theme = $.fn.blockchainoauth.settings.theme;
                    $.fn.blockchainoauth.core.get('themes/'+current_theme+'/config', 'json', function(results)
                    {
                        if($.isPlainObject(results))
                        {   
                            
                            var set = $.extend(
                                {}, 
                                $.fn.blockchainoauth.settings, 
                                results
                            );
                            
                            $.fn.blockchainoauth.settings = set;
                            
                            $.fn.blockchainoauth.defaults();
                            
                            // ONE LAST SECRET CONFIG THAT CAN OVER-RIDE EVERTYHING AND IS NOT STORED IN REPO
                            // THE EXACT LOCATION OF THIS FILE CAN ULTIMATELY BE DEFINED BY PREVIOUS CONFIG FILES
                            var secret_config = 'secret';
                            $.fn.blockchainoauth.core.get(secret_config, 'json', function(results)
                            {
                                if($.isPlainObject(results))
                                {
                                    $.fn.blockchainoauth.settings = $.extend(
                                        {}, 
                                        $.fn.blockchainoauth.settings, 
                                        results
                                    );
                                }
                                
                                if($($.fn.blockchainoauth.element).length < 1)
                                {
                                    // ENSURE THAT ELEMENT EXPECTED IS AVAILABLE
                                    return false;
                                }
                                else
                                {
                                    if(store)
                                    {
                                        localStorage.setItem('nw_inc_config', JSON.stringify($.fn.blockchainoauth.settings));
                                    }

                                    var bs = $.fn.blockchainoauth;
                                    var $bs = blockchainoauth_functions;
                                    var dependencies = $.fn.blockchainoauth.settings.dependencies;
                                    var modules = $.fn.blockchainoauth.settings.modules;
                                    var bootstrap = $.fn.blockchainoauth.settings.bootstrap;
                                    var plugins = $.fn.blockchainoauth.settings.plugins;

                                    if($.fn.blockchainoauth.settings.install === false)
                                    {
                                        dependencies = false;
                                        modules = false;
                                        plugins = false;
                                    }

                                    // UPDATE CORE IF REQUIRED
                                    $bs.update(bs.settings.v, function(saved_version, this_version, refresh)
                                    {
                                        bs.core.upgrade(saved_version, this_version, refresh, function()
                                        {
                                            // USE LESS.css ...?
                                            bs.core.less(function()
                                            {
                                                // INSERT CSS
                                                bs.core.css(function()
                                                {
                                                    if($.isArray(dependencies))
                                                    {
                                                        // INCLUDE JS DEPENDENCIES
                                                        $('.bs.installing').attr('data-loading-content','Now Installing 1 of '+$bs.array_length(dependencies)+' Dependencies');
                                                        $bs.include(bs, 0, dependencies, function()
                                                        {
                                                            if($.isArray(modules))
                                                            {
                                                                // INCLUDE JS MODULES
                                                                $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(modules)+' Modules');
                                                                $bs.include(bs, 0, modules, function()
                                                                {
                                                                    $.fn.blockchainoauth.snippets = {}; 
                                                                    if($.isArray(bootstrap))
                                                                    {
                                                                        // INCLUDE BOOTSTRAP COMPONENTS
                                                                        $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(bootstrap)+' Bootstrap Snippets');
                                                                        bs.core.bootstrap(0, bootstrap, function()
                                                                        {
                                                                            if($.isArray(plugins))
                                                                            {
                                                                                // FINISH WITH PLUGINS
                                                                                $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                                bs.core.plugins(0, plugins, function()
                                                                                {
                                                                                    bs.core.loaded(); 
                                                                                });
                                                                            }
                                                                            else
                                                                            {
                                                                                bs.core.loaded(); 
                                                                            }
                                                                        })
                                                                    }
                                                                    else
                                                                    {
                                                                        if($.isArray(plugins))
                                                                        {
                                                                            // FINISH WITH PLUGINS
                                                                            $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                            bs.core.plugins(0, plugins, function()
                                                                            {
                                                                                bs.core.loaded(); 
                                                                            });
                                                                        }
                                                                        else
                                                                        {
                                                                            bs.core.loaded();
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                            else
                                                            {
                                                                if($.isArray(plugins))
                                                                {
                                                                    // FINISH WITH PLUGINS
                                                                    $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                    bs.core.plugins(0, plugins, function()
                                                                    {
                                                                        bs.core.loaded(); 
                                                                    });
                                                                }
                                                                else
                                                                {
                                                                    bs.core.loaded();
                                                                }
                                                            }
                                                        }, true);
                                                    }
                                                    else
                                                    {
                                                        if($.isArray(modules))
                                                        {
                                                            // INCLUDE JS MODULES
                                                            $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(modules)+' Modules');
                                                            $bs.include(bs, 0, modules, function()
                                                            {
                                                                $.fn.blockchainoauth.snippets = {};
                                                                if($.isArray(bootstrap))
                                                                {
                                                                    // INCLUDE BOOTSTRAP COMPONENTS
                                                                    $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(bootstrap)+' Bootstrap Snippets');
                                                                    bs.core.bootstrap(0, bootstrap, function()
                                                                    {
                                                                        if($.isArray(plugins))
                                                                        {
                                                                            // FINISH WITH PLUGINS
                                                                            $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                            bs.core.plugins(0, plugins, function()
                                                                            {
                                                                                bs.core.loaded(); 
                                                                            });
                                                                        }
                                                                        else
                                                                        {
                                                                            bs.core.loaded();
                                                                        }
                                                                    })
                                                                }
                                                                else
                                                                {
                                                                    if($.isArray(plugins))
                                                                    {
                                                                        // FINISH WITH PLUGINS
                                                                        $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                        bs.core.plugins(0, plugins, function()
                                                                        {
                                                                            bs.core.loaded(); 
                                                                        });
                                                                    }
                                                                    else
                                                                    {
                                                                        bs.core.loaded();
                                                                    }
                                                                }
                                                            });
                                                        }
                                                        else
                                                        {
                                                            $.fn.blockchainoauth.snippets = {};
                                                            if(typeof plugins == 'undefined') plugins = false;
                                                            if($.isArray(bootstrap))
                                                            {
                                                                // INCLUDE BOOTSTRAP COMPONENTS
                                                                $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(bootstrap)+' Bootstrap Snippets');
                                                                bs.core.bootstrap(0, bootstrap, function()
                                                                {
                                                                    if($.isArray(plugins))
                                                                    {
                                                                        // FINISH WITH PLUGINS
                                                                        $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                        bs.core.plugins(0, plugins, function()
                                                                        {
                                                                            bs.core.loaded(); 
                                                                        });
                                                                    }
                                                                    else
                                                                    {
                                                                        bs.core.loaded();
                                                                    }
                                                                })
                                                            }
                                                            else
                                                            {
                                                                if($.isArray(plugins))
                                                                {
                                                                    // FINISH WITH PLUGINS
                                                                    $('.bs.installing').attr('data-loading-content','Now Installing 1 of  '+$bs.array_length(plugins)+' Plugins');
                                                                    bs.core.plugins(0, plugins, function()
                                                                    {
                                                                        bs.core.loaded(); 
                                                                    });
                                                                }
                                                                else
                                                                {
                                                                    bs.core.loaded();
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                            });
                                        });
                                    });
                                }
                            }, skip, false);
                        }
                    }, skip, false);
                }
            }, skip, false);
        }
        
        if(typeof blockchainoauth_defaults == 'undefined')
        {
            var bs = $.fn.blockchainoauth;
            var $bs = blockchainoauth_functions;
            var config = localStorage.getItem('nw_inc_config');
            if(blockchainoauth_functions.json(config)) config = $.parseJSON(config);
            
            var refresh = blockchainoauth_functions.vars('refresh');
            var store = true;
            var cache = false;
            if(typeof bs.settings != 'undefined' && bs.settings && typeof bs.settings.cache != 'undefined')
            {
                cache = bs.settings.cache;
                if(cache.config === false) store = false;
            }
            if(typeof $.fn.blockchainoauth.settngs == 'undefined')
            {
                $.fn.blockchainoauth.settings = {};
            }
            if(typeof $.fn.blockchainoauth.settings.install == 'undefined')
            {
                $.fn.blockchainoauth.settings.install = true;
            }
            if($.fn.blockchainoauth.settings.install === false)
            {
                config = false;
            }
            
            var theme = localStorage.getItem('nw_blockchainoauth_theme');
            if(blockchainoauth_functions.json(theme)) theme = $.parseJSON(theme);

            if(config && $.fn.blockchainoauth.settings.theme != config.theme)
            {
                localStorage.setItem(
                    'nw_blockchainoauth_theme',
                    JSON.stringify(config.theme)
                );
                refresh = true;
            }
            
            if(!config || refresh === true || store === false)
            {
                $.ajax({
                    url: 'defaults.json',
                    dataType: 'json',
                    cache: false,
                    success: function(defaults)
                    {
                        // CONSTRUCT PLUGIN AFTER
                        // FIRST COLLECTING DEFAULTS
                        blockchainoauth_functions.check(defaults, function(passed)
                        {
                            if(passed) plugin(false, false, defaults, store); 
                            else alert('Your browser does not support the minimum requirements - please learn more at http://docs.blockchainoauth.com - either that or you may have private browsing activated, which would also prevent blockchainoauth from working.');
                        });
                    }
                }).fail(function(jqxhr, settings, exception)
                {
                    alert('It seems this browser is unable to load files via AJAX under the current environment. This is usually only a problem when opening blockchainoauth without a web-server. It\'s typically a Chrome issue. Try using Firefox, Safari, or even Internet Explorer.');
                });
            }
            else
            {
                var skip = true;
                blockchainoauth_functions.check(config, function(passed)
                {
                    if(passed) plugin(false, false, config, store, skip); 
                    else alert('Your browser does not support the minimum requirements - please learn more at http://docs.blockchainoauth.com - either that or you may have private browsing activated, which would also prevent blockchainoauth from working.');
                });
            }
        }
        else
        {
            if(blockchainoauth_functions.json(blockchainoauth_defaults))
            {
                blockchainoauth_defaults = $.parseJSON(blockchainoauth_defaults);
            }
            $.fn.blockchainoauth.settings = blockchainoauth_defaults;
            blockchainoauth_functions.check(blockchainoauth_defaults, function()
            {
                $.fn.blockchainoauth.settings.vars = blockchainoauth_functions.vars();
                plugin(false, false, blockchainoauth_defaults); 
            });
        }
    })
    (jQuery, window, document);
};

/*
 
CORE FUNCTIONS 

THESE ARE ALSO REQUIRED BEFORE RELEVANT MODULES HAVE BEEN LOADED

NONETHELESS - THIS SHOULD BE AS SHORT AS POSSIBLE

PERHAPS ONE DAY EVEN NON-EXISTENT :-)
 
*/
var blockchainoauth_js_files = {};
var blockchainoauth_outputted = false;
var blockchainoauth_functions = {
    array_length: function(obj)
    {
        length = 0;
        if(obj) length = Object.keys(obj).length;
        return length;
    },
    check: function(options, callback)
    {
        try 
        {
            var mod = 'nw';
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            if(callback) callback(true);
            else return true;
        } 
        catch(e) 
        {
            if(callback) callback(false);
            else return false;
        }
    },
    exists: function(url, callback)
    {
        try
        {    
            var http = new XMLHttpRequest();
            http.open("GET", url, false);
            http.onreadystatechange = function()
            {
                if(this.status == 404)
                {
                    callback(false);
                }
                else if(this.readyState==4)
                {
                    var msg = this.responseText;
                    if(msg == '404') 
                    {
                        callback(false);
                    }
                    else
                    {
                        callback(true);
                    }
                }
                else
                {
                    callback(false);
                }
            }
            http.send(null);
        }
        catch(err)
        {
            callback(false);
        }
    },
    get_css: function(attributes, store, id)
    {
        if(typeof attributes === "string") 
        {
            var href = attributes;
            attributes = {
                href: href,
                rel: 'stylesheet'
            };
        }
        if(!attributes.rel) 
        {
            attributes.rel = "stylesheet"
        }
        var styleSheet = document.createElement("link");
        for(var key in attributes) 
        {
            styleSheet.setAttribute(key, attributes[key]);
        }
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(styleSheet); 
        if(store === true)
        {
            localStorage.setItem('nw_inc_css_'+id, JSON.stringify(attributes));
        }
    },
    include: function(blockchainoauth, start, files, callback, dependency)
    {
        var head = document.getElementsByTagName('head')[0];
        var refresh = blockchainoauth_functions.vars('refresh');
        var cache = blockchainoauth.settings.cache;
        var limit = files.length;
        var install = blockchainoauth.settings.install;
        
        if(!dependency) dependency = false;
        if(!start) start = 0;
        
        var include_type = 'Modules';
        if(dependency) include_type = 'Dependencies';
        
        $('.bs.installing').attr('data-loading-content','Now Installing ' + (start + 1) + ' of  '+blockchainoauth_functions.array_length(files)+' ' + include_type);
        
        if(install === false)
        {
            callback();
        }
        else if($.isArray(files) && files[start])
        {
            var js = '';
            var file_name = files[start];
            var js_file = localStorage.getItem('nw_js_'+file_name);
            var store = true;
            if(blockchainoauth_functions.json(js_file)) js_file = $.parseJSON(js_file);
            if(!dependency)
            {
                if(cache.modules === false) store = false;
            }
            else
            {
                if(cache.dependencies === false) store = false;
            }
            if(blockchainoauth.settings.cascade === false)
            {
                if(!js_file || refresh === true)
                {
                    $.getScript(file_name + '.js', function(js)
                    {
                        if(store === true)
                        {
                            localStorage.setItem('nw_js_'+file_name, js);
                        }
                        start++;
                        blockchainoauth_functions.include(
                            blockchainoauth, 
                            start, 
                            files, 
                            callback, 
                            dependency
                        );
                    }).fail(function(jqxhr, settings, exception)
                    {
                        start++;
                        blockchainoauth_functions.include(
                            blockchainoauth, 
                            start, 
                            files, 
                            callback, 
                            dependency
                        );
                    });
                }
                else
                {
                    start++;
                    var new_script = document.createElement("script");
                    new_script.setAttribute('type', 'text/javascript');
                    new_script.setAttribute('id', file_name);
                    new_script.text = js_file;
                    head.appendChild(new_script);
                    blockchainoauth_functions.include(
                        blockchainoauth, 
                        start, 
                        files, 
                        callback, 
                        dependency
                    );
                }
            }
            else if(!js_file || refresh || store === false)
            {
                // INCLUDE CORE
                var filename = blockchainoauth.settings.core_base + blockchainoauth.settings.dependency_base + file_name + '.js';
                if(!dependency)
                {
                    filename = blockchainoauth.settings.core_base + blockchainoauth.settings.module_base + file_name + '.js';
                }
                $.getScript(filename, function(core_js)
                {
                    if(core_js != '404')
                    {
                        js+= "\n" + core_js;
                    }
                    var theme_filename = blockchainoauth.settings.theme_base + blockchainoauth.settings.theme+'/js/dependencies/' + file_name + '.js';
                    if(!dependency)
                    {
                        theme_filename = blockchainoauth.settings.theme_base + blockchainoauth.settings.theme+'/js/modules/' + file_name + '.js';
                    }
                    $.getScript(theme_filename, function(theme_js)
                    {
                        if(theme_js != '404')
                        {
                            js+= "\n" + theme_js;
                        }
                        if(store === true && file_name != 'bitcoinjs-lib')
                        {
                            localStorage.setItem('nw_js_'+file_name, js);
                        }   
                        start++;
                        blockchainoauth_functions.include(blockchainoauth, start, files, callback, dependency);
                    }).fail(function(jqxhr, settings, exception)
                    {
                        start++;
                        if(store === true)
                        {
                            localStorage.setItem('nw_js_'+file_name, js);
                        }   
                        blockchainoauth_functions.include(blockchainoauth, start, files, callback, dependency);
                    });
                }).fail(function(jqxhr, settings, exception)
                {
                    var theme_filename = blockchainoauth.settings.theme_base + blockchainoauth.settings.theme+'/js/dependencies/' + file_name + '.js';
                    if(!dependency)
                    {
                        theme_filename = blockchainoauth.settings.theme_base + blockchainoauth.settings.theme+'/js/modules/' + file_name + '.js';
                    }
                    $.getScript(theme_filename, function(theme_js)
                    {
                        if(theme_js != '404')
                        {
                            js+= "\n" + theme_js;
                        }

                        if(store === true)
                        {
                            localStorage.setItem('nw_js_'+file_name, js);
                        }
                        
                        start++;
                        blockchainoauth_functions.include(blockchainoauth, start, files, callback, dependency);
                    }).fail(function(jqxhr, settings, exception)
                    {
                        start++;
                        if(store === true)
                        {
                            localStorage.setItem('nw_js_'+file_name, js);
                        }
                        blockchainoauth_functions.include(blockchainoauth, start, files, callback, dependency);
                    });
                });

            }
            else
            {
                start++;
                var new_script = document.createElement("script");
                new_script.setAttribute('type', 'text/javascript');
                new_script.setAttribute('id', file_name);
                new_script.text = js_file;
                head.appendChild(new_script);
                blockchainoauth_functions.include(blockchainoauth, start, files, callback, dependency);
            }
        }
        else
        {
            if(callback) callback();
        }
    },
    initialize: function()
    {
        if(!blockchainoauth_outputted) 
        {
            blockchainoauth_outputted = true;
            if(typeof(jQuery) === 'undefined') 
            {
                blockchainoauth_functions.js(
                    'js-blockchainoauth-jquery', 
                    'blockchainoauth/js/dependencies/jquery.min.js', 
                    function()
                    {
                        blockchainoauth_core();
                    }
                );
            } 
            else 
            {
                $ = jQuery;
                blockchainoauth_core();
            }
        }
    },
    js: function(id, src, callback)
    {
        var t = document.getElementsByTagName('head')[0];
        var s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('src', src);
        s.setAttribute('id', id);
        s.onload = function()
        {
            callback();
        }
        t.appendChild(s);
    },
    json: function(string)
    {
        try
        {
            var json = $.parseJSON(string);
            if(json) return true;
            else return false;
        }
        catch(error)
        {
            return false;
        }
    },
    slug: function(slug)
    {
        if(slug != 'undefined' && slug)
        {
            var name = slug.replace(/ /g, '_');
            name = name.replace(/-/g, '_');
            name = name.replace(/'/g, '');
            name = name.replace(/"/g, '');
            name = name.replace(/#/g, '');
            return name.toLowerCase();
        }
        else
        {
            return false;
        }
    },
    unslug: function(slug)
    {
        var name = slug.replace(/_/g, ' ');
        return name.charAt(0).toUpperCase() + name.slice(1);
    },
    update: function(version, callback)
    {
        var results = localStorage.getItem('nw_blockchainoauth_v');
        if(results) results = $.parseJSON(results);
        if(/^[0-9\.]+$/.test(version) && /^[0-9\.]+$/.test(results)) 
        {
            var current_version_array = version.split('.');
            var stored_version_array = results.split('.');
            if($.isArray(stored_version_array))
            {
                $.each(stored_version_array, function(k, v)
                {
                    if(parseInt(current_version_array[k]) > parseInt(v))
                    {
                        $.fn.blockchainoauth.settings.vars.refresh = true;
                    }
                    if(k >= (blockchainoauth_functions.array_length(stored_version_array) - 1))
                    {
                        localStorage.setItem('nw_blockchainoauth_v', JSON.stringify(version));
                        callback(results, version, $.fn.blockchainoauth.settings.vars.refresh);
                    }
                })
            }
            else
            {
                $.fn.blockchainoauth.settings.vars.refresh = true;
                localStorage.setItem('nw_blockchainoauth_v', JSON.stringify(version));
                callback(results, version, true);
            }
        }
        else
        {
            if(version != results) 
            {
                $.fn.blockchainoauth.settings.vars.refresh = true;
                localStorage.setItem('nw_blockchainoauth_v', JSON.stringify(version));
                callback(results, version, true);
            }
            else
            {
                callback(results, version, false);
            }
        }
    },
    vars: function(variable)
    {
        var bs = $.fn.blockchainoauth;
        if(!variable) variable = false;
        if(variable == 'refresh' && $.isPlainObject(bs.settings) && bs.settings.refresh === true)
        {
            return true;
        }
        else if(variable)
        {
            if(
                typeof $.fn.blockchainoauth.settings == 'undefined' 
                || typeof $.fn.blockchainoauth.settings == null 
                || !$.fn.blockchainoauth.settings
                || typeof $.fn.blockchainoauth.settings.vars == 'undefined'
                || typeof $.fn.blockchainoauth.settings.vars[variable] == 'undefined'
            ){
                return false;
            }
            else
            {
                return $.fn.blockchainoauth.settings.vars[variable];
            }
        }
        else
        {
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            var original_vars = vars;
            vars = {};
            for(var i=0;i<original_vars.length;i++) 
            {
                var pair = original_vars[i].split("=");
                var value = pair[1];
                if(value === 'false') value = false;
                if(value === 'true') value = true;
                vars[pair[0]] = value;
            }
            return vars;
        }
    }
};
var blockchainoauth_js_scripts;
window.onload = function()
{
    //blockchainoauth_functions.initialize();
}
blockchainoauth_functions.initialize();