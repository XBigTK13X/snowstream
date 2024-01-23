package com.simplepathstudios.snowstream.viewmodel;

import android.content.SharedPreferences;
import android.net.Uri;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.SnowstreamSettings;

import java.net.URLEncoder;

public class SettingsViewModel extends ViewModel {
    public MutableLiveData<Settings> Data;
    public SettingsViewModel(){
        Data = new MutableLiveData<>();
    }

    public void initialize(SharedPreferences preferences){
        Settings settings = new Settings();
        settings.Preferences = preferences;
        settings.EnableDebugLog = settings.Preferences.getBoolean("EnableDebugLog", false);
        settings.ServerUrl = settings.Preferences.getString("ServerUrl", SnowstreamSettings.ProdServerUrl);
        SnowstreamSettings.EnableDebugLog = settings.EnableDebugLog;
        Data.setValue(settings);
    }

    public void setDebugLog(boolean enabled){
        Settings settings = Data.getValue();
        settings.EnableDebugLog = enabled;
        SharedPreferences.Editor editor = settings.Preferences.edit();
        editor.putBoolean("EnableDebugLog", enabled);
        editor.commit();
        Data.setValue(settings);
        SnowstreamSettings.EnableDebugLog = settings.EnableDebugLog;
    }


    public void setServerUrl(String serverUrl){
        Settings settings = Data.getValue();
        settings.ServerUrl = serverUrl;
        SharedPreferences.Editor editor = settings.Preferences.edit();
        editor.putString("ServerUrl", serverUrl);
        editor.commit();
        Data.setValue(settings);
    }

    public class Settings {
        public SharedPreferences Preferences;
        public boolean EnableDebugLog;
        public String ServerUrl;
    }
}
