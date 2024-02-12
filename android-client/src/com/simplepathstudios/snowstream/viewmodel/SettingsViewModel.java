package com.simplepathstudios.snowstream.viewmodel;

import android.content.SharedPreferences;
import android.net.Uri;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.SnowstreamSettings;
import com.simplepathstudios.snowstream.api.model.SnowstreamAuthToken;

import java.net.URLEncoder;

public class SettingsViewModel extends ViewModel {
    public MutableLiveData<Settings> Data;
    public SettingsViewModel(){
        Data = new MutableLiveData<>();
    }

    public void initialize(SharedPreferences preferences){
        Settings settings = new Settings();
        settings.Preferences = preferences;
        settings.EnableDebugLog = settings.Preferences.getBoolean("EnableDebugLog", true);
        settings.ServerUrl = settings.Preferences.getString("ServerUrl", SnowstreamSettings.DevServerUrl);
        settings.Username = settings.Preferences.getString("Username", null);
        settings.AuthToken = settings.Preferences.getString("Token", null);
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

    public void setAuthToken(String username, SnowstreamAuthToken token){
        Settings settings = Data.getValue();
        settings.Username = username;
        settings.AuthToken = token == null ? null : token.access_token;
        SharedPreferences.Editor editor = settings.Preferences.edit();
        editor.putString("Username", username);
        editor.putString("Token", token == null ? null : token.access_token);
        editor.commit();
        Data.setValue(settings);
    }

    public class Settings {
        public SharedPreferences Preferences;
        public boolean EnableDebugLog;
        public String ServerUrl;
        public String Username;
        public String AuthToken;
    }
}
