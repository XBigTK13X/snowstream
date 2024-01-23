package com.simplepathstudios.snowstream;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.widget.Toast;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;

import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers;
import io.reactivex.rxjava3.core.Observable;
import io.reactivex.rxjava3.schedulers.Schedulers;

public class Util {
    private static final String TAG = "Util";

    private static Context __context;
    private static Thread.UncaughtExceptionHandler __androidExceptionHandler;

    public static void setGlobalContext(Context context){
        __context = context;
    }

    public static Context getGlobalContext(){
        if(__context == null){
            Log.d(TAG,"Global context is null, it must be set before it is read");
        }
        return __context;
    }

    private static int MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
    private static int MILLISECONDS_PER_MINUTE = 1000 * 60;
    public static String millisecondsToTimestamp(int milliseconds){
        if(milliseconds >= MILLISECONDS_PER_HOUR){
            int hours = (milliseconds / (MILLISECONDS_PER_HOUR));
            int minutes = (milliseconds / (MILLISECONDS_PER_MINUTE)) % 60;
            int seconds = (milliseconds / 1000) % 60;
            return String.format("%02dh %02dm %02ds", hours, minutes, seconds);
        }
        int minutes = (milliseconds / (MILLISECONDS_PER_MINUTE)) % 60;
        int seconds = (milliseconds / 1000) % 60;
        return String.format("%02dm %02ds", minutes, seconds);
    }

    public static void error(String tag, Throwable e){
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        Util.log(tag, "Message: "+e.getMessage()+"\n StackTrace: " + sw.toString());
    }

    public static void log(String tag, String message){
        Util.log(tag, message, false);
    }

    public static void log(String tag, String message, boolean force){
        try{
            if(!SnowstreamSettings.EnableDebugLog &&!force){
                return;
            }
            String timestamp = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss").format(new Date());
            String logEntry = String.format("[Snowstream] - %s - %s - %s : %s",System.currentTimeMillis(), timestamp,tag,message);
            Log.d(tag, logEntry);
        } catch(Exception e){
            Log.d(TAG, "An error occurred while logging",e);
        }

    }

    private static Toast lastToast;
    public static void toast(String message){
        if(lastToast != null){
            lastToast.cancel();
        }
        new Handler(Looper.getMainLooper()).post(new Runnable(){
            @Override
            public void run() {
                lastToast = Toast.makeText(getGlobalContext(), message, Toast.LENGTH_SHORT);
                lastToast.show();
            }
        });
    }

    public static void registerGlobalExceptionHandler() {
        if(__androidExceptionHandler == null){
            __androidExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();

            Thread.setDefaultUncaughtExceptionHandler(
                    new Thread.UncaughtExceptionHandler() {
                        @Override
                        public void uncaughtException(
                                Thread paramThread,
                                Throwable paramThrowable
                        ) {
                            StringWriter stringWriter = new StringWriter();
                            PrintWriter printWriter = new PrintWriter(stringWriter);
                            paramThrowable.printStackTrace(printWriter);
                            String stackTrace = stringWriter.toString();
                            Util.log(TAG, "An error occurred " +paramThrowable.getMessage() +" => "+stackTrace, true);
                            if (__androidExceptionHandler != null)
                                __androidExceptionHandler.uncaughtException(
                                        paramThread,
                                        paramThrowable
                                ); //Delegates to Android's error handling
                            else
                                System.exit(2); //Prevents the service/app from freezing
                        }
                    });
        }
    }

    public static void confirmMenuAction(MenuItem menuItem, String message, DialogInterface.OnClickListener confirmListener){
        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.getInstance());
        builder.setMessage(message);
        builder.setPositiveButton("Yes", confirmListener);
        builder.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {

            }
        });
        menuItem.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
            @Override
            public boolean onMenuItemClick(MenuItem item) {
                AlertDialog dialog = builder.create();
                dialog.show();
                return false;
            }
        });
    }

    public static void enableFullscreen(){
        Window window = MainActivity.getInstance().getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsControllerCompat windowInsetsControllerCompat = new WindowInsetsControllerCompat(window, window.getDecorView());
        windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.systemBars());
        windowInsetsControllerCompat.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

}