package com.simplepathstudios.snowstream;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.MenuItem;
import android.view.Window;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.annotation.IdRes;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.fragment.app.FragmentActivity;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;
import androidx.lifecycle.ViewModelStoreOwner;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.simplepathstudios.snowstream.viewmodel.ShelfListViewModel;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Util {
    private static final String TAG = "Util";

    private static Thread.UncaughtExceptionHandler __androidExceptionHandler;

    private static ComponentActivity __activity;
    public static void setMainActivity(ComponentActivity activity){
        __activity = activity;
    }
    public static ComponentActivity getMainActivity(){
        return __activity;
    }

    public static Context getGlobalContext(){
        if(__activity == null){
            Log.d(TAG,"Global context is null, it must be set before it is read");
        }
        return __activity.getApplicationContext();
    }

    public static <T extends ViewModel> T getViewModel(Class<T> target){
        return target.cast(new ViewModelProvider(Util.getMainActivity()).get(target));
    }

    public static void navigateTo(@IdRes Integer navigationResourceId){
        NavController navController = Navigation.findNavController(Util.getMainActivity(), R.id.nav_host_fragment);
        navController.navigate(navigationResourceId);
    }

    public static void navigateTo(@IdRes Integer navigationResourceId, Bundle bundle){
        NavController navController = Navigation.findNavController(Util.getMainActivity(), R.id.nav_host_fragment);
        navController.navigate(navigationResourceId,bundle);
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
        AlertDialog.Builder builder = new AlertDialog.Builder(getMainActivity());
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
        Window window = Util.getMainActivity().getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsControllerCompat windowInsetsControllerCompat = new WindowInsetsControllerCompat(window, window.getDecorView());
        windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.systemBars());
        windowInsetsControllerCompat.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

}