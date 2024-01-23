package com.simplepathstudios.snowstream;


import android.net.Uri;

public class SnowstreamSettings {
    public static final String BuildDate = "January 22, 2024";
    public static final String ClientVersion = "1.0.0";
    public static boolean EnableDebugLog = false;
    public static final Uri UpdateSnowstreamUrl = Uri.parse("http://9914.us:8091/software/android/snowstream.apk");
    public static final boolean DebugResourceLeaks = false;
    public static String DevServerUrl = "http://192.168.1.20:8000";
    public static String ProdServerUrl = "http://9914.us:9064";
    public static final int SearchDelayMilliseconds = 300;
}
